import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function FinancialSummaryCard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get('https://neura-ops.onrender.com/api/v1/financecost/financialsummary', {
                    headers: { Authorization: "Bearer " + token }
                });
                setData(res.data);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Error loading financial summary");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                    <CardDescription>Loading...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">Please wait while we fetch your data.</div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                    <CardDescription>Error</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-red-500 text-sm">{error}</div>
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const formatCurrency = (value: number) =>
        `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>High-level financial performance</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Sales Revenue</span>
                        <span className="font-medium">{formatCurrency(data.totalSalesRevenue)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Delivered Quantity</span>
                        <span className="font-medium">{data.totalDeliveredQuantity.toLocaleString()} units</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Selling Price</span>
                        <span className="font-medium">{formatCurrency(data.averageSellingPrice)}/unit</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Fixed Cost</span>
                        <span className="font-medium">{formatCurrency(data.totalFixedCost)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Variable Cost</span>
                        <span className="font-medium">{formatCurrency(data.totalVariableCost)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Gross Margin</span>
                        <span className="font-medium text-emerald-500">{formatCurrency(data.grossMargin)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Net Margin</span>
                        <span className={`font-medium ${data.netMargin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {formatCurrency(data.netMargin)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
