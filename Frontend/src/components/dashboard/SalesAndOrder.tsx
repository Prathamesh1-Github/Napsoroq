import { useEffect, useState } from 'react';
import axios from 'axios';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    ArrowUp,
    Clock,
    Package,
    Truck,
    Box,
} from 'lucide-react';
import { SalesChart } from '../charts/SalesChart';

interface OrderStatusMetrics {
    ordersByStatus: {
        _id: string;
        count: number;
        orders: any[];
    }[];
    metrics: {
        avgProcessingTime: string;
        percentageChange: string;
    };
}

interface CustomerInsights {
    activeCustomers: number;
    avgOrderValue: number;
    avgOrderQuantity: number;
    topCustomers: {
        customerName: string;
        totalOrders: number;
        totalQuantity: number;
    }[];
}

interface SalesPipeline {
    pipelineMetrics: {
        _id: string;
        count: number;
        totalQuantity: number;
        totalValue: number;
    }[];
    totalPipelineValue: number;
}

interface Order {
    _id: string;
    customerId: string;
    productId: {
        _id: string;
        productName: string;
    };
    quantityOrdered: number;
    quantityDelivered: number;
    remainingQuantity: number;
    orderDate: string;
    deliveryDate: string;
    status: 'In Progress' | 'Completed';
}

export function SalesAndOrder() {
    const [orderMetrics, setOrderMetrics] = useState<OrderStatusMetrics | null>(null);
    const [customerInsights, setCustomerInsights] = useState<CustomerInsights | null>(null);
    const [salesPipeline, setSalesPipeline] = useState<SalesPipeline | null>(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderFilter, setOrderFilter] = useState<'all' | 'completed' | 'in-progress'>('all');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [metricsRes, insightsRes, pipelineRes, ordersRes] = await Promise.all([
                    axios.get('https://neura-ops.onrender.com/api/v1/orders/status-metrics',
                        {
                            headers: {
                                Authorization: 'Bearer ' + localStorage.getItem('token'),
                            },
                        }
                    ),
                    axios.get('https://neura-ops.onrender.com/api/v1/orders/customer-insights',
                        {
                            headers: {
                                Authorization: 'Bearer ' + localStorage.getItem('token'),
                            },
                        }
                    ),
                    axios.get('https://neura-ops.onrender.com/api/v1/orders/sales-pipeline',
                        {
                            headers: {
                                Authorization: 'Bearer ' + localStorage.getItem('token'),
                            },
                        }
                    ),
                    axios.get(`https://neura-ops.onrender.com/api/v1/orders${orderFilter === 'all' ? '' :
                        orderFilter === 'completed' ? '/completed' : '/in-progress'
                        }`,
                        {
                            headers: {
                                Authorization: 'Bearer ' + localStorage.getItem('token'),
                            },
                        })
                ]);

                console.log('Orders Response:', ordersRes.data.orders);

                setOrderMetrics(metricsRes.data);
                setCustomerInsights(insightsRes.data);
                setSalesPipeline(pipelineRes.data);
                setOrders(ordersRes.data.orders);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [orderFilter]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Sales Performance</CardTitle>
                        <CardDescription>
                            Order volume and revenue trends
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <SalesChart />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Status</CardTitle>
                        <CardDescription>Current order processing status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">New Orders</div>
                                    <div className="text-2xl font-bold">
                                        {orderMetrics?.ordersByStatus.find(s => s._id === 'In Progress')?.count || 0}
                                    </div>
                                    <div className="flex items-center text-xs text-emerald-500">
                                        <ArrowUp className="mr-1 h-3 w-3" />
                                        {orderMetrics?.metrics.percentageChange}% vs. yesterday
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Processing</div>
                                    <div className="text-2xl font-bold">
                                        {orderMetrics?.ordersByStatus.find(s => s._id === 'In Progress')?.count || 0}
                                    </div>
                                    <div className="flex items-center text-xs text-amber-500">
                                        <Clock className="mr-1 h-3 w-3" />
                                        Avg. {orderMetrics?.metrics.avgProcessingTime} days
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="mb-2 text-sm font-medium">Order Pipeline</div>
                                <div className="space-y-2">
                                    {orderMetrics?.ordersByStatus.map((status, i) => {
                                        const total = orderMetrics.ordersByStatus.reduce((acc, curr) => acc + curr.count, 0);
                                        const percent = (status.count / total) * 100;
                                        return (
                                            <div key={i} className="grid grid-cols-3 gap-2">
                                                <div className="text-sm">{status._id}</div>
                                                <div className="text-sm">{status.count}</div>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={percent} className="h-2" />
                                                    <span className="text-xs">{percent.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer Insights</CardTitle>
                        <CardDescription>Key customer metrics and analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Active Customers</div>
                                    <div className="text-2xl font-bold">{customerInsights?.activeCustomers}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Avg. Order Quantity</div>
                                    <div className="text-2xl font-bold">
                                        {/* {formatCurrency(customerInsights?.avgOrderValue || 0)} */}
                                        {(customerInsights?.avgOrderQuantity || 0).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="mb-2 text-sm font-medium">Top Customers</div>
                                <div className="space-y-2">
                                    {customerInsights?.topCustomers.map((customer, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="text-sm">{customer.customerName}</div>
                                            <div className="flex items-center space-x-2">
                                                <div className="text-sm font-medium">
                                                    {(customer.totalQuantity)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>OrderRevenue Breakdown</CardTitle>
                        <CardDescription>Order Revenue Breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-muted-foreground">Total Order Value</div>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(salesPipeline?.totalPipelineValue || 0)}
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="mb-2 text-sm font-medium">Status Distribution</div>
                                <div className="space-y-2">
                                    {salesPipeline?.pipelineMetrics.map((metric, i) => {
                                        const value = metric.totalValue;
                                        return (
                                            <div key={i} className="grid grid-cols-3 gap-2">
                                                <div className="text-sm">{metric._id}</div>
                                                <div className="text-sm">{metric.count}</div>
                                                <div className="text-sm">{formatCurrency(value)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>Track and manage order status</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setOrderFilter('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${orderFilter === 'all'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    All Orders
                                </button>
                                <button
                                    onClick={() => setOrderFilter('completed')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${orderFilter === 'completed'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Completed
                                </button>
                                <button
                                    onClick={() => setOrderFilter('in-progress')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${orderFilter === 'in-progress'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    In Progress
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order._id}
                                    className="p-4 rounded-lg border hover:border-gray-100 transition-colors"
                                >
                                    <div className="grid grid-cols-6 gap-4">
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${order.status === 'Completed' ? 'bg-green-100' : 'bg-amber-100'
                                                    }`}>
                                                    <Package className={`h-5 w-5 ${order.status === 'Completed' ? 'text-green-600' : 'text-amber-600'
                                                        }`} />
                                                </div>
                                                <div>
                                                    <div className="font-medium">Order #{order._id.slice(-6)}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Created {formatDate(order.orderDate)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center">
                                            <div className="text-sm font-medium">Product</div>
                                            <div className="flex items-center gap-2">
                                                <Box className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {order.productId.productName}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center">
                                            <div className="text-sm font-medium">Quantity</div>
                                            <div className="flex items-center gap-2">
                                                <Box className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {order.quantityDelivered}/{order.quantityOrdered}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center">
                                            <div className="text-sm font-medium">Delivery Date</div>
                                            <div className="flex items-center gap-2">
                                                <Truck className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {formatDate(order.deliveryDate)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end">
                                            <Badge
                                                className={`${order.status === 'Completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-amber-100 text-amber-800'
                                                    }`}
                                            >
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default SalesAndOrder
