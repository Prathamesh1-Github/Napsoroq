import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Card,
    CardHeader,
    CardContent,
    CardDescription,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    Loader2,
    Receipt,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SalesLedger {
    _id: string;
    order: any;
    customer: any;
    totalAmount: number;
    receivedPayments: Array<{
        amount: number;
        transactionId: string;
        date: string;
        mode: string;
    }>;
    status: string;
    balance: number;
}

interface Invoice {
    _id: string;
    invoiceNumber: string;
    order: any;
    customer: any;
    type: 'Partial' | 'Final';
    totalAmount: number;
    status: string;
    issueDate: string;
    dueDate: string;
}

const FinancialDashboard = () => {
    const [salesLedgers, setSalesLedgers] = useState<SalesLedger[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ledgersRes, invoicesRes] = await Promise.all([
                    axios.get('https://neura-ops.onrender.com/api/v1/financial/sales-ledger',
                        {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                    ),
                    axios.get('https://neura-ops.onrender.com/api/v1/financial/invoice',
                        {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                    )
                ]);
                setSalesLedgers(ledgersRes.data.ledgers);
                setInvoices(invoicesRes.data.invoices);
            } catch (error) {
                console.error('Error fetching financial data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const totalReceivables = salesLedgers.reduce((acc, ledger) => acc + ledger.balance, 0);
    const totalReceived = salesLedgers.reduce((acc, ledger) =>
        acc + ledger.receivedPayments.reduce((sum, payment) => sum + payment.amount, 0), 0
    );

    const stats = [
        {
            title: 'Total Receivables',
            value: `₹${totalReceivables.toLocaleString()}`,
            icon: <ArrowUpRight className="w-6 h-6 text-red-500" />,
            description: 'Outstanding payments'
        },
        {
            title: 'Total Received',
            value: `₹${totalReceived.toLocaleString()}`,
            icon: <ArrowDownRight className="w-6 h-6 text-green-500" />,
            description: 'Collected payments'
        },
        {
            title: 'Active Invoices',
            value: invoices.filter(inv => inv.status !== 'Paid').length,
            icon: <FileText className="w-6 h-6 text-blue-500" />,
            description: 'Pending invoices'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 w-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Financial Overview</h1>
                    <p className="text-muted-foreground">Track payments, invoices, and financial metrics</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardDescription className="text-sm font-medium">
                                    {stat.title}
                                </CardDescription>
                                {stat.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Payments */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Recent Payments</h2>
                        <CardDescription>Latest payment transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            {salesLedgers.map(ledger =>
                                ledger.receivedPayments.map((payment, index) => (
                                    <motion.div
                                        key={payment.transactionId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-4 border-b"
                                    >
                                        <div className="flex items-center gap-4">
                                            <CreditCard className="w-5 h-5 text-blue-500" />
                                            <div>
                                                <p className="font-medium">{payment.transactionId}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(payment.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                                            <Badge variant="outline">{payment.mode}</Badge>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Recent Invoices */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Recent Invoices</h2>
                        <CardDescription>Latest generated invoices</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            {invoices.map((invoice, index) => (
                                <Link to={`/invoicedetails/${invoice._id}`} key={invoice._id} className='text-white'>
                                <motion.div
                                    key={invoice._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-4 border-b"
                                >
                                    <div className="flex items-center gap-4">
                                        <Receipt className="w-5 h-5 text-purple-500" />
                                        <div>
                                            <p className="font-medium">{invoice.invoiceNumber}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(invoice.issueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">₹{invoice.totalAmount.toLocaleString()}</p>
                                        <Badge
                                            variant={invoice.status === 'Paid' ? 'default' : 'outline'}
                                            className={invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : ''}
                                        >
                                            {invoice.status}
                                        </Badge>
                                    </div>
                                </motion.div>
                                </Link>
                            ))}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FinancialDashboard;