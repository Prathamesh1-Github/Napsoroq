import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Card,
    CardHeader,
    CardContent,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Loader2,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface OrderInfo {
    productName: string;
    quantityOrdered: number;
    quantityDelivered: number;
    deliveredValue: number;
    advance: number;
    totalReceived: number;
    totalOrderValue: number;
    creditNotes: number;
    overallBalance: number;
    totalIngoOutgo: number;
}

interface SalesLedger {
    _id: string;
    customerName: string;
    orderInfo: OrderInfo;
    status: string;
    receivedPayments: Payment[];
    balance: number;
    totalAmount: number;
    dueDate: string;
    paymentStatus: string;
}

interface Payment {
    amount: number;
    transactionId: string;
    date: string;
    mode: string;
    _id: string;
}

const LedgerManagement = () => {
    const [salesLedgers, setSalesLedgers] = useState<SalesLedger[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPayment, setNewPayment] = useState({
        amount: 0,
        transactionId: '',
        mode: 'Bank Transfer'
    });
    const [selectedLedger, setSelectedLedger] = useState<string | null>(null);
    const [openPaymentHistory, setOpenPaymentHistory] = useState<string | null>(null);

    useEffect(() => {
        fetchLedgers();
    }, []);

    const fetchLedgers = async () => {
        try {
            const response = await axios.get('https://neura-ops.onrender.com/api/v1/financial/sales-ledger/active',
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            setSalesLedgers(response.data.ledgers);
        } catch (error) {
            console.error('Error fetching ledgers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async () => {
        if (!selectedLedger) return;

        try {
            await axios.put(`https://neura-ops.onrender.com/api/v1/financial/sales-ledger/${selectedLedger}`, {
                payment: {
                    ...newPayment,
                    date: new Date().toISOString()
                }
            }, 
            {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
        );

            fetchLedgers();
            setNewPayment({
                amount: 0,
                transactionId: '',
                mode: 'Bank Transfer'
            });
            setSelectedLedger(null);
        } catch (error) {
            console.error('Error adding payment:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const totalReceivables = salesLedgers.reduce((acc, ledger) => acc + ledger.balance, 0);
    const totalReceived = salesLedgers.reduce((acc, ledger) => acc + (ledger.totalAmount - ledger.balance), 0);

    return (
        <div className="p-6 space-y-6 w-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Ledger Management</h1>
                    <p className="text-muted-foreground">Track and manage payment ledgers</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Payment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Record New Payment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm font-medium">Select Ledger</label>
                                <Select onValueChange={(value) => setSelectedLedger(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a ledger" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {salesLedgers.map(ledger => (
                                            <SelectItem key={ledger._id} value={ledger._id}>
                                                {ledger.customerName} - ₹{ledger.balance.toLocaleString()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Amount</label>
                                <Input
                                    type="number"
                                    value={newPayment.amount}
                                    onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Transaction ID</label>
                                <Input
                                    value={newPayment.transactionId}
                                    onChange={(e) => setNewPayment({ ...newPayment, transactionId: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Payment Mode</label>
                                <Select
                                    onValueChange={(value) => setNewPayment({ ...newPayment, mode: value })}
                                    defaultValue={newPayment.mode}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Cheque">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handlePaymentSubmit} className="w-full">
                                Record Payment
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ArrowUpRight className="w-5 h-5 text-green-500" />
                            <h2 className="text-xl font-semibold">Total Receivables</h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">₹{totalReceivables.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground mt-1">Outstanding payments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ArrowDownRight className="w-5 h-5 text-blue-500" />
                            <h2 className="text-xl font-semibold">Total Received</h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">₹{totalReceived.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground mt-1">Collected payments</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Active Ledgers</h2>
                    <CardDescription>Track payment status and history</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Total Order</TableHead>
                                    <TableHead>Advance</TableHead>
                                    <TableHead>Received</TableHead>
                                    <TableHead>Delivered Value</TableHead>
                                    <TableHead>Credit Notes</TableHead>
                                    <TableHead>In / Out</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesLedgers.map((ledger) => (
                                    <TableRow key={ledger._id}>
                                        <TableCell>{ledger.customerName}</TableCell>
                                        <TableCell>{ledger.orderInfo.productName}</TableCell>
                                        <TableCell>₹{ledger.orderInfo.totalOrderValue.toLocaleString()}</TableCell>
                                        <TableCell className="text-blue-600">₹{ledger.orderInfo.advance.toLocaleString()}</TableCell>
                                        <TableCell className="text-blue-600">₹{ledger.orderInfo.totalReceived.toLocaleString()}</TableCell>
                                        <TableCell className="text-green-600">₹{ledger.orderInfo.deliveredValue.toLocaleString()}</TableCell>
                                        <TableCell className="text-purple-600">₹{ledger.orderInfo.creditNotes.toLocaleString()}</TableCell>
                                        <TableCell className={`font-bold ${
                                            ledger.orderInfo.totalIngoOutgo < 0
                                            ? 'text-red-600'
                                            : ledger.orderInfo.totalIngoOutgo > 0
                                            ? 'text-green-600'
                                            : 'text-gray-600'
                                        }`}>
                                            ₹{ledger.orderInfo.totalIngoOutgo.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={ledger.paymentStatus === 'Paid' ? 'default' : 'outline'}>
                                                {ledger.paymentStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Collapsible open={openPaymentHistory === ledger._id} onOpenChange={(open) => setOpenPaymentHistory(open ? ledger._id : null)}>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        {openPaymentHistory === ledger._id ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                                                        History
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <div className="space-y-2">
                                                        {ledger.receivedPayments.length > 0 ? (
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Date</TableHead>
                                                                        <TableHead>Transaction ID</TableHead>
                                                                        <TableHead className="text-right">Amount</TableHead>
                                                                        <TableHead>Mode</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {ledger.receivedPayments.map((payment) => (
                                                                        <TableRow key={payment._id}>
                                                                            <TableCell>
                                                                                {new Date(payment.date).toLocaleDateString()}
                                                                            </TableCell>
                                                                            <TableCell>{payment.transactionId}</TableCell>
                                                                            <TableCell className="text-right">
                                                                                ₹{payment.amount.toLocaleString()}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Badge variant="outline">
                                                                                    {payment.mode}
                                                                                </Badge>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        ) : (
                                                            <div className="py-4 px-6 text-center text-muted-foreground">
                                                                No payment history available
                                                            </div>
                                                        )}
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LedgerManagement;