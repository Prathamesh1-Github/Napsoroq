import { useEffect, useState } from 'react';
import axios from 'axios';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  Package,
  CalendarCheck
} from 'lucide-react';


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import type { Order as OrderType, Customer, Product } from '@/types/index';


interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

const CompletedOrdersPage = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const calculateAverageDeliveryTime = () => {
    const completed = orders.filter(order => order.status === 'Completed' && order.orderCompletionDate);
    if (completed.length === 0) return 0;

    const deliveryTimes = completed.map(order => {
      const orderDate = new Date(order.orderDate);
      const completionDate = new Date(order.orderCompletionDate!);
      return completionDate.getTime() - orderDate.getTime();
    });

    const averageMs = deliveryTimes.reduce((acc, time) => acc + time, 0) / completed.length;
    return Math.round(averageMs / (1000 * 60 * 60 * 24));
  };


  const calculateOnTimeDeliveryRate = () => {
    const completed = orders.filter(order => order.status === 'Completed' && order.orderCompletionDate);
    if (completed.length === 0) return '0.0%';

    const onTime = completed.filter(order =>
      new Date(order.orderCompletionDate!) <= new Date(order.deliveryDate)
    );

    return `${((onTime.length / completed.length) * 100).toFixed(1)}%`;
  };



  const fetchCompletedOrders = async () => {
    try {
      const response = await axios.get('https://neura-ops.onrender.com/api/v1/orders/completed',
        {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
      );
      // Defensive mapping to ensure correct types
      setOrders(
        response.data.orders.map((order: any) => ({
          ...order,
          customerId: order.customerId ? order.customerId : undefined,
          productId: order.productId ? order.productId : undefined,
        }))
      );
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      toast({ description: 'Failed to fetch completed orders.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedOrders();
  }, []);


  const handlePrintInvoice = (order: OrderType) => {
    if (!order || !order.customerId || !order.productId) return;
    const customer = order.customerId as Customer;
    const product = order.productId as Product;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let currentY = 25;

    // Company Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Business Name', 20, currentY);

    // Invoice Header (Top Right)
    doc.setFontSize(18);
    doc.text(`Invoice ${order._id.slice(-6)}`, pageWidth - 20, currentY, { align: 'right' });
    doc.setFontSize(10);
    doc.text('Tax Invoice', pageWidth - 20, currentY + 8, { align: 'right' });

    currentY += 30;

    // Bill To Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 20, currentY);

    // Invoice Details (Top Right)
    const detailsX = pageWidth - 80;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Issue date:', detailsX, currentY);
    doc.text(format(new Date(order.orderDate), 'dd/MM/yyyy'), detailsX + 30, currentY);

    currentY += 8;
    doc.text(customer.customerName, 20, currentY);
    doc.text('Due date:', detailsX, currentY);
    doc.text(format(new Date(order.deliveryDate), 'dd/MM/yyyy'), detailsX + 30, currentY);

    currentY += 6;
    doc.text(customer.companyAddress || '', 20, currentY);
    currentY += 6;
    doc.text(`Phone: ${customer.phoneNumber || ''}`, 20, currentY);
    currentY += 6;
    doc.text(`Email: ${customer.email || ''}`, 20, currentY);
    currentY += 6;
    if (customer.gstNumber) {
      doc.text(`GST: ${customer.gstNumber}`, 20, currentY);
    }

    currentY += 25;

    // GST and pricing calculations
    const gstRate = 0.18;
    const productTotal = (product.sellingPrice || 0) * order.quantityDelivered;
    const baseAmount = productTotal / (1 + gstRate);
    const gstAmount = productTotal - baseAmount;

    const tableData = [
      [
        product.productName,
        order.quantityDelivered.toString(),
        `₹${(product.sellingPrice || 0).toLocaleString()}`,
        `₹${productTotal.toLocaleString()}`
      ]
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Description', 'Quantity', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], fontSize: 9 },
      styles: { fontSize: 10, cellPadding: 8 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 45, halign: 'center' },
        2: { cellWidth: 40, halign: 'center' },
        3: { cellWidth: 40, halign: 'center' }
      }
    });

    // Use (doc as any).lastAutoTable.finalY for compatibility
    currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : currentY + 30;

    // Summary
    const summaryX = pageWidth - 90;
    doc.setFontSize(11);
    doc.text('Subtotal:', summaryX, currentY);
    doc.text(`₹${baseAmount.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });

    currentY += 8;
    doc.text(`GST ${gstRate * 100}%:`, summaryX, currentY);
    doc.text(`₹${gstAmount.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });

    currentY += 5;
    doc.line(summaryX, currentY, pageWidth - 20, currentY);
    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', summaryX, currentY);
    doc.text(`₹${productTotal.toLocaleString()}`, pageWidth - 20, currentY, { align: 'right' });

    // Footer
    const footerY = pageHeight - 40;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Business Name', 20, footerY);
    doc.text('123 Business Street, City, State - 123456', 20, footerY + 8);
    doc.text('Phone: +91 1234567890', 20, footerY + 16);
    doc.text('Email: contact@yourbusiness.com', 20, footerY + 24);
    doc.setFontSize(8);
    doc.text('Terms: Payment due within 30 days.', 20, footerY + 32);

    doc.save(`Invoice_${order._id.slice(-6)}_${format(new Date(), 'ddMMyyyy')}.pdf`);
  };



  const stats: StatCard[] = [
    {
      title: 'Completed Orders',
      value: orders.length,
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
      description: 'Total completed orders',
      trend: {
        value: '+12.5%',
        positive: true
      }
    },
    {
      title: 'Unique Customers',
      value: new Set(orders.map(order => order.customerId?._id)).size,
      icon: <Users className="w-6 h-6 text-blue-500" />,
      description: 'Active customers served',
      trend: {
        value: '+5.2%',
        positive: true
      }
    },
    {
      title: 'Avg. Delivery Time',
      value: `${calculateAverageDeliveryTime()} days`,
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      description: 'Order to completion',
      trend: {
        value: '-8.3%',
        positive: true
      }
    },
    {
      title: 'On-Time Delivery Rate',
      value: calculateOnTimeDeliveryRate(),
      icon: <TrendingUp className="w-6 h-6 text-indigo-500" />,
      description: 'Completed before deadline',
      trend: {
        value: '+3.7%',
        positive: true
      }
    }
  ];


  return (
    <div className="p-6 w-screen mx-auto space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Completed Orders</h1>
          <p className="text-muted-foreground">Track and manage your completed order history</p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          <CalendarCheck className="w-4 h-4 mr-2" />
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-background/10">
                  {stat.icon}
                </div>
                {stat.trend && (
                  <Badge variant={stat.trend.positive ? 'default' : 'destructive'} className="px-2 py-1">
                    {stat.trend.value}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <h2 className="text-3xl font-bold">{stat.value}</h2>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ScrollArea className="h-[600px] rounded-lg border bg-card">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-primary h-8 w-8" />
          </div>
        ) : (
          <AnimatePresence>
            <div className="p-4 space-y-4">
              {orders.map((order, index) => (
                order.customerId && order.productId && (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{order.productId?.productName}</h3>
                            <p className="text-sm text-muted-foreground">{order.customerId?.customerName}</p>
                          </div>
                        </div>
                        <div>
                        <Badge variant="outline" className={order.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}>
                          {order.status}
                        </Badge>
                        <Button
                          variant="outline"
                          className='ml-5'
                          onClick={() => handlePrintInvoice(order)}
                        >
                          Print Invoice
                        </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <div className="flex justify-between text-sm gap-x-10">
                            <div className="space-y-1">
                              <p className="text-muted-foreground">Order Date</p>
                              <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground">Delivery Date</p>
                              <p className="font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground">Completion Date</p>
                              <p className="font-medium">{order.orderCompletionDate ? new Date(order.orderCompletionDate).toLocaleDateString() : '-'}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Quantity</p>
                            <p className="font-medium">{order.quantityDelivered}/{order.quantityOrdered}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Delivery Progress</span>
                            <span className="font-medium">{Math.round((order.quantityDelivered / order.quantityOrdered) * 100)}%</span>
                          </div>
                          <Progress value={(order.quantityDelivered / order.quantityOrdered) * 100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                )
              ))}
            </div>
          </AnimatePresence>
        )}
      </ScrollArea>
    </div>
  );
};

export default CompletedOrdersPage;
