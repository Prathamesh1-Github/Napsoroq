import { useState, useEffect } from 'react';
import { Users, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerSummaryData {
    activeCustomers: number;
    avgOrderQuantity: number;
    avgOrderValue: number;
}

function CustomerSummary() {
    const [summaryData, setSummaryData] = useState<CustomerSummaryData | null>(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchSummaryData = async () => {
            try {
                const response = await fetch('https://neura-ops.onrender.com/api/v1/orders/customer-insights', {
                    headers: {
                        Authorization: 'Bearer ' + token,
                    },
                });
                const data = await response.json();
                setSummaryData(data);
            } catch (error) {
                console.error('Error fetching customer summary:', error);
            }
        };

        fetchSummaryData();
    }, []);

    if (!summaryData) return <div>Loading...</div>;

    const metrics = [
        {
            title: 'Active Customers',
            value: summaryData.activeCustomers,
            icon: Users,
            description: 'Active in last 30 days',
            className: 'text-blue-500',
        },
        {
            title: 'Avg Order Value',
            value: `₹${summaryData.avgOrderValue.toFixed(2)}`,
            icon: DollarSign,
            description: 'Per transaction',
            className: 'text-green-500',
        },
        {
            title: 'Avg Quantity/Order',
            value: summaryData.avgOrderQuantity.toFixed(2),
            icon: Package,
            description: 'Units per order',
            className: 'text-purple-500',
        },
    ];

    return (
        <Card className='w-screen'>
            <CardHeader>
                <CardTitle>Customer Summary Metrics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    {metrics.map((metric) => (
                        <Card key={metric.title}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-full bg-muted ${metric.className}`}>
                                            <metric.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{metric.title}</p>
                                            <p className="text-sm text-muted-foreground">{metric.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold">{metric.value}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default CustomerSummary;
