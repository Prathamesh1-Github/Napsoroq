import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Card,
    CardHeader,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Send } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Invoice {
    _id: string;
    invoiceNumber: string;
    order: any;
    customer: any;
    items: Array<{
        product: any;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
    subtotal: number;
    tax: number;
    deliveryCost: number;
    totalAmount: number;
    status: string;
    issueDate: string;
    dueDate: string;
}

const InvoiceDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await axios.get(`https://neura-ops.onrender.com/api/v1/financial/invoice/${id}`,
                    {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                );
                console.log(response)
                setInvoice(response.data.invoice);
            } catch (error) {
                console.error('Error fetching invoice:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchInvoice();
    }, [id]);

    const generatePDF = () => {
        if (!invoice) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('INVOICE', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 40);
        doc.text(`Date: ${format(new Date(invoice.issueDate), 'dd/MM/yyyy')}`, 20, 45);

        // Customer Details
        doc.text('Bill To:', 20, 60);
        doc.text(invoice.customer.customerName, 20, 65);
        doc.text(invoice.customer.companyAddress, 20, 70);
        doc.text(`GST: ${invoice.customer.gstNumber}`, 20, 75);

        // Items Table
        const tableData = invoice.items.map(item => [
            item.product.productName,
            item.quantity.toString(),
            `₹${item.unitPrice.toLocaleString()}`,
            `₹${item.totalPrice.toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: 90,
            head: [['Item', 'Quantity', 'Unit Price', 'Total']],
            body: tableData,
        });

        // Summary
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.text(`Subtotal: ₹${invoice.subtotal.toLocaleString()}`, 140, finalY);
        doc.text(`Tax: ₹${invoice.tax.toLocaleString()}`, 140, finalY + 5);
        doc.text(`Delivery: ₹${invoice.deliveryCost.toLocaleString()}`, 140, finalY + 10);
        doc.text(`Total: ₹${invoice.totalAmount.toLocaleString()}`, 140, finalY + 15);

        doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!invoice) {
        return <div>Invoice not found</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto w-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Invoice {invoice.invoiceNumber}</h1>
                    <p className="text-muted-foreground">
                        Created on {format(new Date(invoice.issueDate), 'dd MMM yyyy')}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={generatePDF} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                    <Button>
                        <Send className="w-4 h-4 mr-2" />
                        Send to Customer
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Customer Details</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="font-medium">{invoice.customer.customerName}</p>
                            <p className="text-sm text-muted-foreground">{invoice.customer.companyAddress}</p>
                            <p className="text-sm">GST: {invoice.customer.gstNumber}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Invoice Summary</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Status</span>
                                <Badge>{invoice.status}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Due Date</span>
                                <span>{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                                <span>Total Amount</span>
                                <span>₹{invoice.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Items</h2>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {invoice.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">{item.product.productName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Quantity: {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">₹{item.totalPrice.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">
                                        ₹{item.unitPrice.toLocaleString()} per unit
                                    </p>
                                </div>
                            </div>
                        ))}

                        <div className="border-t pt-4 mt-6">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{invoice.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>₹{invoice.tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Delivery Cost</span>
                                    <span>₹{invoice.deliveryCost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span>₹{invoice.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InvoiceDetails;