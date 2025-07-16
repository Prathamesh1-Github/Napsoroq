import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@/components/ui/table';
import {
    Card,
    CardHeader,
    CardContent,
    CardDescription,
} from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { 
    Loader2, 
    Package2, 
    IndianRupee,
    CreditCard
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface Order {
    _id: string;
    productId: { _id: string; productName: string } | null;
    customerId: { _id: string; customerName: string } | null;
    quantityOrdered: number;
    quantityDelivered: number;
    remainingQuantity: number;
    deliveryDate: string;
    status: 'In Progress' | 'Completed' | 'Partially Cancelled' | 'Fully Cancelled';
    orderDate: string;
    sellingPrice: number;
    totalOrderValue: number;
    pendingAmount: number;
    financialStatus: string;
    advancePayment?: {
        amount: number;
        transactionId: string;
        mode: string;
    };
    payments: Array<{
        amount: number;
        transactionId: string;
        mode: string;
        date: string;
    }>;
    creditNotes: Array<{
        amount: number;
        reason: string;
        status: string;
        date: string;
    }>;
}

interface OrderUpdate {
    [orderId: string]: {
        quantityDelivered: string;
        payment?: {
            amount?: number; // <-- make optional
            transactionId?: string; // <-- make optional
            mode?: string; // <-- make optional
        };
        creditNote?: {
            amount: number;
            reason: string;
        };
    };
}


interface StatCard {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    description: string;
}

const OrderUpdatePage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [updatedOrders, setUpdatedOrders] = useState<OrderUpdate>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const { toast } = useToast();

    const totalPendingAmount = orders.reduce((acc, order) => acc + order.pendingAmount, 0);
    const totalAdvanceReceived = orders.reduce((acc, order) => acc + (order.advancePayment?.amount || 0), 0);

    const stats: StatCard[] = [
        {
            title: 'Active Orders',
            value: orders.length,
            icon: <Package2 className="h-6 w-6 text-blue-500" />,
            description: 'Orders in progress',
        },
        {
            title: 'Pending Amount',
            value: `₹${totalPendingAmount.toLocaleString()}`,
            icon: <IndianRupee className="h-6 w-6 text-red-500" />,
            description: 'Total receivables',
        },
        {
            title: 'Advance Received',
            value: `₹${totalAdvanceReceived.toLocaleString()}`,
            icon: <CreditCard className="h-6 w-6 text-green-500" />,
            description: 'Total advance payments',
        },
        // {
        //     title: 'Credit Notes',
        //     value: orders.reduce((acc, order) => acc + order.creditNotes.length, 0),
        //     icon: <FileText className="h-6 w-6 text-purple-500" />,
        //     description: 'Active credit notes',
        // },
    ];

    const fetchOrders = async () => {
        try {
            const response = await axios.get<{ orders: Order[] }>(
                'https://neura-ops.onrender.com/api/v1/orders/in-progress',
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            setOrders(response.data.orders);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to fetch orders',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleQuantityChange = (orderId: string, value: string) => {
        const order = orders.find((o) => o._id === orderId);
        if (!order) return;

        // Remove any non-numeric characters except decimal point
        const sanitizedValue = value.replace(/[^\d]/g, '');
        
        // Convert to number for validation
        const numValue = parseInt(sanitizedValue, 10);

        // Validate the number is within bounds
        if (numValue > order.remainingQuantity) {
            toast({
                variant: 'destructive',
                title: 'Invalid Quantity',
                description: `Maximum allowed quantity is ${order.remainingQuantity}`,
            });
            return;
        }

        // Store the sanitized string value
        setUpdatedOrders((prev) => ({
            ...prev,
            [orderId]: {
                ...prev[orderId],
                quantityDelivered: sanitizedValue,
            },
        }));
    };

    const handlePaymentChange = (orderId: string, field: string, value: string) => {
        setUpdatedOrders((prev) => ({
            ...prev,
            [orderId]: {
                ...prev[orderId],
                payment: {
                    ...prev[orderId]?.payment,
                    [field]: field === 'amount' ? Number(value) : value,
                },
            },
        }));
    };

    // const handleCreditNoteChange = (orderId: string, field: string, value: string) => {
    //     setUpdatedOrders((prev) => ({
    //         ...prev,
    //         [orderId]: {
    //             ...prev[orderId],
    //             creditNote: {
    //                 ...prev[orderId]?.creditNote,
    //                 [field]: field === 'amount' ? Number(value) : value,
    //             },
    //         },
    //     }));
    // };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const updates = Object.entries(updatedOrders).map(([orderId, update]) => ({
                id: orderId,
                ...update,
                quantityDelivered: parseInt(update.quantityDelivered, 10), // Convert string to number for API
            }));

            await axios.put('https://neura-ops.onrender.com/api/v1/orders/bulk-deliver', {
                updates,
            }, 
            {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
        );

            toast({
                title: 'Success',
                description: 'Orders updated successfully!',
            });

            setUpdatedOrders({});
            await fetchOrders();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update orders',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-screen p-8">
            <div className="w-full space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Update deliveries, payments, and manage credit notes
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <AnimatePresence>
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardDescription className="text-sm font-medium">
                                            {stat.title}
                                        </CardDescription>
                                        {stat.icon}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {stat.value}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {stat.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold">Order Updates</h2>
                                <CardDescription>
                                    Manage deliveries, payments, and credit notes
                                </CardDescription>
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || Object.keys(updatedOrders).length === 0}
                            >
                                {submitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {submitting ? 'Updating...' : 'Submit Updates'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <ScrollArea className="h-[600px] rounded-md border">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className="font-semibold">Order Details</TableCell>
                                            <TableCell className="font-semibold">Delivery Update</TableCell>
                                            <TableCell className="font-semibold">Payment Update</TableCell>
                                            <TableCell className="font-semibold">Credit Note</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <AnimatePresence>
                                            {orders.map((order, index) => (
                                                <motion.tr
                                                    key={order._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="group"
                                                >
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">
                                                                {order.productId?.productName}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {order.customerId?.customerName}
                                                            </div>
                                                            <Badge variant={
                                                                order.financialStatus === 'Overdue' ? 'destructive' :
                                                                order.financialStatus === 'Fully Paid' ? 'default' :
                                                                'outline'
                                                            }>
                                                                {order.financialStatus}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="space-y-2">
                                                            <Input
                                                                type="text"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                value={updatedOrders[order._id]?.quantityDelivered ?? ''}
                                                                onChange={(e) =>
                                                                    handleQuantityChange(order._id, e.target.value)
                                                                }
                                                                placeholder={`Max ${order.remainingQuantity}`}
                                                            />
                                                            <Progress
                                                                value={(order.quantityDelivered / order.quantityOrdered) * 100}
                                                                className="h-2"
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="space-y-2">
                                                            <Input
                                                                type="number"
                                                                placeholder="Payment amount"
                                                                onChange={(e) =>
                                                                    handlePaymentChange(order._id, 'amount', e.target.value)
                                                                }
                                                            />
                                                            <Select
                                                                onValueChange={(value) =>
                                                                    handlePaymentChange(order._id, 'mode', value)
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Payment mode" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="UPI">UPI</SelectItem>
                                                                    <SelectItem value="NEFT">NEFT</SelectItem>
                                                                    <SelectItem value="RTGS">RTGS</SelectItem>
                                                                    <SelectItem value="Cash">Cash</SelectItem>
                                                                    <SelectItem value="Cheque">Cheque</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Input
                                                                placeholder="Transaction ID"
                                                                onChange={(e) =>
                                                                    handlePaymentChange(order._id, 'transactionId', e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    {/* <TableCell>
                                                        <div className="space-y-2">
                                                            <Input
                                                                type="number"
                                                                placeholder="Credit note amount"
                                                                onChange={(e) =>
                                                                    handleCreditNoteChange(order._id, 'amount', e.target.value)
                                                                }
                                                            />
                                                            <Select
                                                                onValueChange={(value) =>
                                                                    handleCreditNoteChange(order._id, 'reason', value)
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Reason" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Cancellation">Cancellation</SelectItem>
                                                                    <SelectItem value="Return">Return</SelectItem>
                                                                    <SelectItem value="Rate Difference">Rate Difference</SelectItem>
                                                                    <SelectItem value="Quality Issue">Quality Issue</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </TableCell>
                                                     */}
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OrderUpdatePage;