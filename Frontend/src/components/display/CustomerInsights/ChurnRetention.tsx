import { useState, useEffect } from 'react';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChurnData {
    churningCustomers: number;
    increasingVolume: number;
    decreasingVolume: number;
}

function ChurnRetention() {
    const [churnData, setChurnData] = useState<ChurnData | null>(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchChurnData = async () => {
            try {
                const response = await fetch('https://neura-ops.onrender.com/api/v1/customer-insights/churn', {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
                const data = await response.json();
                setChurnData(data);
            } catch (error) {
                console.error('Error fetching churn data:', error);
            }
        };

        fetchChurnData();
    }, []);

    if (!churnData) return <div>Loading...</div>;

    const metrics = [
        {
            title: 'Potential Churn',
            value: churnData.churningCustomers,
            icon: AlertCircle,
            description: 'No orders in 60 days',
            variant: 'destructive' as const,
        },
        {
            title: 'Increasing Volume',
            value: churnData.increasingVolume,
            icon: TrendingUp,
            description: 'Growing customers',
            variant: 'default' as const,
        },
        {
            title: 'Decreasing Volume',
            value: churnData.decreasingVolume,
            icon: TrendingDown,
            description: 'Declining customers',
            variant: 'secondary' as const,
        },
    ];

    return (
        <Card className="col-span-2 w-screen">
            <CardHeader>
                <CardTitle>Churn & Retention</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    {metrics.map((metric) => (
                        <Card key={metric.title}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 rounded-full bg-muted">
                                            <metric.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{metric.title}</p>
                                            <p className="text-sm text-muted-foreground">{metric.description}</p>
                                        </div>
                                    </div>
                                    <Badge variant={metric.variant}>{metric.value}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default ChurnRetention;