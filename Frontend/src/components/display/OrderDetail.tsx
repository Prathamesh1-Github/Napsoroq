import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  AlertCircle,
  Clock,
  Package,
  User,
  Phone,
  Mail,
  Building,
  DollarSign,
  FileText
} from 'lucide-react';
import { getOrder } from '../../api/index';
import { Order } from '../../types/index';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) return;
        const data = await getOrder(orderId);
        setOrder(data.order);
      } catch (err) {
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!order) return <div className="text-center p-4">Order not found</div>;

  const isDelayed = new Date(order.deliveryDate) < new Date();
  const progressPercentage = (order.quantityDelivered / order.quantityOrdered) * 100;



  // const handlePrintInvoice = () => {
  //   if (!order) return;

  //   const doc = new jsPDF();
  //   const pageWidth = doc.internal.pageSize.width;
  //   const pageHeight = doc.internal.pageSize.height;

  //   // Company Header
  //   doc.setFontSize(24);
  //   doc.setFont('helvetica', 'bold');
  //   doc.text('Your Business Name', 20, 25);

  //   doc.setFontSize(12);
  //   doc.setFont('helvetica', 'normal');
  //   doc.text('Your Business Tagline', 20, 32);

  //   // Invoice Header (Top Right)
  //   doc.setFontSize(20);
  //   doc.setFont('helvetica', 'bold');
  //   doc.text(`Invoice ${order._id.slice(-6)}`, pageWidth - 20, 25, { align: 'right' });

  //   doc.setFontSize(10);
  //   doc.setFont('helvetica', 'normal');
  //   doc.text('Tax Invoice', pageWidth - 20, 32, { align: 'right' });

  //   // Bill To Section
  //   doc.setFontSize(10);
  //   doc.setFont('helvetica', 'bold');
  //   doc.text('BILL TO', 20, 50);

  //   doc.setFont('helvetica', 'normal');
  //   doc.text(order.customerId.customerName, 20, 58);
  //   doc.text(order.customerId.companyAddress, 20, 65);
  //   doc.text(`Phone: ${order.customerId.phoneNumber}`, 20, 72);
  //   doc.text(`Email: ${order.customerId.email}`, 20, 79);
  //   if (order.customerId.gstNumber) {
  //     doc.text(`GST: ${order.customerId.gstNumber}`, 20, 86);
  //   }

  //   // Invoice Details (Top Right)
  //   const detailsX = pageWidth - 70;
  //   doc.text('Issue date:', detailsX, 50);
  //   doc.text(format(new Date(order.orderDate), 'dd/MM/yyyy'), detailsX + 25, 50);

  //   doc.text('Due date:', detailsX, 58);
  //   doc.text(format(new Date(order.deliveryDate), 'dd/MM/yyyy'), detailsX + 25, 58);

  //   doc.text('Reference:', detailsX, 66);
  //   doc.text(order._id.slice(-6), detailsX + 25, 66);

  //   // Invoice Summary Header Bar
  //   const headerY = 100;
  //   doc.setFillColor(52, 152, 219); // Blue color
  //   doc.rect(20, headerY, pageWidth - 40, 12, 'F');

  //   doc.setTextColor(255, 255, 255);
  //   doc.setFont('helvetica', 'bold');
  //   doc.text('Invoice No.', 25, headerY + 8);
  //   doc.text('Issue date', 70, headerY + 8);
  //   doc.text('Due date', 120, headerY + 8);
  //   doc.text('Total due (₹)', pageWidth - 25, headerY + 8, { align: 'right' });

  //   // Invoice Summary Values
  //   doc.setTextColor(0, 0, 0);
  //   doc.setFont('helvetica', 'normal');
  //   doc.text(order._id.slice(-6), 25, headerY + 20);
  //   doc.text(format(new Date(order.orderDate), 'dd/MM/yyyy'), 70, headerY + 20);
  //   doc.text(format(new Date(order.deliveryDate), 'dd/MM/yyyy'), 120, headerY + 20);
  //   doc.setFont('helvetica', 'bold');
  //   doc.text(`₹${order.totalOrderValue.toLocaleString()}`, pageWidth - 25, headerY + 20, { align: 'right' });

  //   // Items Table
  //   const tableStartY = headerY + 35;

  //   // Calculate GST (assuming 18% GST)
  //   const gstRate = 0.18;
  //   const baseAmount = order.totalOrderValue / (1 + gstRate);
  //   const gstAmount = order.totalOrderValue - baseAmount;

  //   const tableData = [
  //     [
  //       order.productId.productName,
  //       order.quantityOrdered.toString(),
  //       `₹${order.sellingPrice.toLocaleString()}`,
  //       `₹${order.totalOrderValue.toLocaleString()}`
  //     ]
  //   ];

  //   // Add delivery cost if exists
  //   if (order.deliveryCost > 0) {
  //     tableData.push([
  //       'Delivery Charges',
  //       '1',
  //       `₹${order.deliveryCost.toLocaleString()}`,
  //       `₹${order.deliveryCost.toLocaleString()}`
  //     ]);
  //   }

  //   autoTable(doc, {
  //     startY: tableStartY,
  //     head: [['Description', 'Quantity', 'Unit price (₹)', 'Amount (₹)']],
  //     body: tableData,
  //     theme: 'grid',
  //     headStyles: {
  //       fillColor: [240, 240, 240],
  //       textColor: [0, 0, 0],
  //       fontStyle: 'bold'
  //     },
  //     styles: {
  //       fontSize: 10,
  //       cellPadding: 8
  //     },
  //     columnStyles: {
  //       0: { cellWidth: 80 },
  //       1: { cellWidth: 25, halign: 'center' },
  //       2: { cellWidth: 35, halign: 'right' },
  //       3: { cellWidth: 35, halign: 'right' }
  //     }
  //   });

  //   // Summary section
  //   const summaryStartY = doc.lastAutoTable.finalY + 10;
  //   const summaryX = pageWidth - 80;

  //   doc.setFont('helvetica', 'normal');
  //   doc.text('Subtotal:', summaryX, summaryStartY);
  //   doc.text(`₹${baseAmount.toFixed(2)}`, pageWidth - 25, summaryStartY, { align: 'right' });

  //   doc.text(`GST ${(gstRate * 100)}% from ₹${baseAmount.toFixed(2)}:`, summaryX, summaryStartY + 8);
  //   doc.text(`₹${gstAmount.toFixed(2)}`, pageWidth - 25, summaryStartY + 8, { align: 'right' });

  //   // Draw line above total
  //   doc.line(summaryX, summaryStartY + 12, pageWidth - 25, summaryStartY + 12);

  //   doc.setFont('helvetica', 'bold');
  //   doc.text('Total (₹):', summaryX, summaryStartY + 20);
  //   doc.text(`₹${order.totalOrderValue.toLocaleString()}`, pageWidth - 25, summaryStartY + 20, { align: 'right' });

  //   // Payment Status Section
  //   if (order.advancePayment || order.payments.length > 0) {
  //     const paymentSectionY = summaryStartY + 35;
  //     doc.setFont('helvetica', 'bold');
  //     doc.text('Payment Summary:', 20, paymentSectionY);

  //     let currentY = paymentSectionY + 10;
  //     doc.setFont('helvetica', 'normal');

  //     if (order.advancePayment) {
  //       doc.text(`Advance Payment (${order.advancePayment.mode}):`, 20, currentY);
  //       doc.text(`₹${order.advancePayment.amount.toLocaleString()}`, 120, currentY);
  //       doc.text(format(new Date(order.advancePayment.date), 'dd/MM/yyyy'), 160, currentY);
  //       currentY += 8;
  //     }

  //     order.payments.forEach((payment, index) => {
  //       doc.text(`Payment ${index + 1} (${payment.mode}):`, 20, currentY);
  //       doc.text(`₹${payment.amount.toLocaleString()}`, 120, currentY);
  //       doc.text(format(new Date(payment.date), 'dd/MM/yyyy'), 160, currentY);
  //       currentY += 8;
  //     });

  //     doc.setFont('helvetica', 'bold');
  //     doc.text('Total Paid:', 20, currentY + 5);
  //     doc.text(`₹${order.totalPaidAmount.toLocaleString()}`, 120, currentY + 5);

  //     doc.text('Pending Amount:', 20, currentY + 13);
  //     doc.text(`₹${order.pendingAmount.toLocaleString()}`, 120, currentY + 13);
  //   }

  //   // Footer with company details
  //   const footerY = pageHeight - 30;
  //   doc.setFontSize(9);
  //   doc.setFont('helvetica', 'normal');
  //   doc.text('📞 +91 1234567890', 20, footerY);
  //   doc.text('🌐 www.yourbusiness.com', 70, footerY);
  //   doc.text('📧 contact@yourbusiness.com', 140, footerY);

  //   doc.text('Your Business Name', 20, footerY + 8);
  //   doc.text('123 Business Street, City, State - 123456', 20, footerY + 15);

  //   // Terms and conditions
  //   doc.setFontSize(8);
  //   doc.text('Terms: Payment due within 30 days. Late payments may incur additional charges.', 20, footerY + 22);

  //   doc.save(`Invoice_${order._id.slice(-6)}_${format(new Date(), 'ddMMyyyy')}.pdf`);
  // };



  const handlePrintInvoice = () => {
    if (!order) return;

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
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice ${order._id.slice(-6)}`, pageWidth - 20, currentY, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
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
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(order.customerId.customerName, 20, currentY);
    doc.setFontSize(10);
    doc.text('Due date:', detailsX, currentY);
    doc.text(format(new Date(order.deliveryDate), 'dd/MM/yyyy'), detailsX + 30, currentY);

    currentY += 6;
    doc.setFontSize(10);
    doc.text(order.customerId.companyAddress, 20, currentY);
    currentY += 6
    doc.text(`Phone: ${order.customerId.phoneNumber}`, 20, currentY);
    currentY += 6
    doc.text(`Email: ${order.customerId.email}`, 20, currentY);
    currentY += 6
    if (order.customerId.gstNumber) {
      doc.text(`GST: ${order.customerId.gstNumber}`, 20, currentY);
    }

    currentY += 25;

    // Items Table
    const tableStartY = currentY;

    // Calculate GST (assuming 18% GST)
    const gstRate = 0.18;
    const productTotal = order.sellingPrice * order.quantityOrdered;
    const baseAmount = productTotal / (1 + gstRate);
    const gstAmount = productTotal - baseAmount;

    const tableData = [
      [
        order.productId.productName,
        order.quantityOrdered.toString(),
        `$${order.sellingPrice.toLocaleString()}`,
        `$${productTotal.toLocaleString()}`
      ]
    ];

    autoTable(doc, {
      startY: tableStartY,
      head: [['Description', 'Quantity', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontSize: 9
      },
      styles: {
        fontSize: 10,
        cellPadding: 8
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 45, halign: 'center' },
        2: { cellWidth: 40, halign: 'center' },
        3: { cellWidth: 40, halign: 'center' }
      }
    });
    currentY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : currentY + 30;

    // Summary section (right aligned)
    const summaryX = pageWidth - 90;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', summaryX, currentY);
    doc.text(`$${baseAmount.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });

    currentY += 8;
    doc.text(`GST ${(gstRate * 100)}%:`, summaryX, currentY);
    doc.text(`$${gstAmount.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });

    currentY += 5;
    // Draw line above total
    doc.line(summaryX, currentY, pageWidth - 20, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', summaryX, currentY);
    doc.text(`$${productTotal.toLocaleString()}`, pageWidth - 20, currentY, { align: 'right' });

    // Footer with company details (at bottom of page)
    const footerY = pageHeight - 40;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Business info
    doc.text('Your Business Name', 20, footerY);
    doc.text('123 Business Street, City, State - 123456', 20, footerY + 8);

    // Contact info
    doc.text('Phone: +91 1234567890', 20, footerY + 16);
    doc.text('Email: contact@yourbusiness.com', 20, footerY + 24);

    // Terms
    doc.setFontSize(8);
    doc.text('Terms: Payment due within 30 days.', 20, footerY + 32);

    doc.save(`Invoice_${order._id.slice(-6)}_${format(new Date(), 'ddMMyyyy')}.pdf`);
  };




  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white-900">Order #{order._id.slice(-6)}</h1>
        <p className="text-white-500">Created on {format(new Date(order.orderDate), 'dd MMM yyyy')}</p>
        <button
          onClick={handlePrintInvoice}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <FileText className="w-5 h-5" />
          Generate Professional Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Customer Information */}
        <div className="  p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-white-900">Customer Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-white-500">Customer Name</p>
                <p className="font-medium text-white-900">{order.customerId.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-white-500">Contact Number</p>
                <p className="font-medium text-white-900">{order.customerId.phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-white-500">Email</p>
                <p className="font-medium text-white-900">{order.customerId.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-white-500">Company Address</p>
                <p className="font-medium text-white-900">{order.customerId.companyAddress}</p>
              </div>
            </div>
            {order.customerId.gstNumber && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">GST Number</p>
                <p className="font-medium text-gray-900">{order.customerId.gstNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="  p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-white-900">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-white-500">Product</p>
                <p className="font-medium text-white-900">{order.productId.productName}</p>
                {order.productId.productSKU && (
                  <p className="text-sm text-white-500">SKU: {order.productId.productSKU}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-white-500">Price Per Unit</p>
                <p className="font-medium text-white-900">₹{order.sellingPrice.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-white-500">Delivery Date</p>
                <p className="font-medium text-white-900">{format(new Date(order.deliveryDate), 'dd MMM yyyy')}</p>
                {isDelayed && (
                  <span className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> Delayed
                  </span>
                )}
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Order Status</p>
              <p className="font-semibold text-blue-700">{order.status}</p>
              <p className="text-sm text-gray-500 mt-1">Financial Status</p>
              <p className="font-medium text-green-600">{order.financialStatus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="  p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white-900">Order Progress</h2>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-100">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-green-600">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-green-50">
            <div
              style={{ width: `${progressPercentage}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300"
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{order.quantityDelivered}</p>
              <p className="text-sm text-gray-500">units</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-2xl font-bold text-orange-600">{order.remainingQuantity}</p>
              <p className="text-sm text-gray-500">units</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="  p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white-900">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Order Value</p>
            <p className="text-2xl font-bold text-blue-600">₹{order.totalOrderValue?.toLocaleString() ?? '0'}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">₹{order.totalPaidAmount?.toLocaleString() ?? '0'}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Pending Amount</p>
            <p className="text-2xl font-bold text-orange-600">₹{order.pendingAmount?.toLocaleString() ?? '0'}</p>
          </div>
          <div className="p-4 rounded-lg">
            <p className="text-sm text-gray-500">Delivery Cost</p>
            <p className="text-2xl font-bold text-white-600">₹{order.deliveryCost.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {(order.advancePayment || (order.payments && order.payments.length > 0)) && (
        <div className="  p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-white-900">Payment History</h2>
          <div className="space-y-3">
            {order.advancePayment && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Advance Payment</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(order.advancePayment.date), 'dd MMM yyyy')} • {order.advancePayment.mode}
                  </p>
                  {order.advancePayment.transactionId && (
                    <p className="text-xs text-gray-400">ID: {order.advancePayment.transactionId}</p>
                  )}
                </div>
                <p className="text-lg font-bold text-green-600">₹{order.advancePayment.amount.toLocaleString()}</p>
              </div>
            )}
            {order.payments?.map((payment: import('../../types').Payment, index: number) => (
              <div key={payment._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Payment {index + 1}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(payment.date), 'dd MMM yyyy')} • {payment.mode}
                  </p>
                  {payment.notes && (
                    <p className="text-sm text-gray-400">{payment.notes}</p>
                  )}
                  {payment.transactionId && (
                    <p className="text-xs text-gray-400">ID: {payment.transactionId}</p>
                  )}
                </div>
                <p className="text-lg font-bold text-blue-600">₹{payment.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetail;