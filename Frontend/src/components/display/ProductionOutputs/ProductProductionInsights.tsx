import { useEffect, useState } from 'react';
import axios from 'axios';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    AlertTriangle,
    CheckCircle2,
    RefreshCcw,
    Boxes,
    PackageCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RawMaterialDifference {
    [key: string]: number;
}

interface Product {
    _id: string;
    productId: string;
    productName: string;
    productCategory: string;
    productSKU: string;
    uom: string;
    productVariant: string;
    sellingPrice?: number;
    currentStock: number;
    minimumStockLevel: number;
    reorderPoint: number;
}

interface ProductInsight {
    product: Product;
    productType: string;
    totalUnitsProduced: number;
    goodUnitsWithoutRework: number;
    scrapUnits: number;
    reworkRatio: string;
    yieldPercentage: string;
    rawMaterialEfficiency: RawMaterialDifference;
    estimatedMaterial: RawMaterialDifference;
    productionCost: string;
}

interface ProductionData {
    overall: {
        totalUnitsProduced: number;
        goodUnitsWithoutRework: number;
        scrapUnits: number;
        reworkRatio: string;
        yieldPercentage: string;
        rawMaterialDifference: RawMaterialDifference;
    };
    insights: ProductInsight[];
}

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ElementType;
    description?: string;
    suffix?: string;
    status?: 'success' | 'warning' | 'error';
}

export default function ProductProductionInsights() {
    const [data, setData] = useState<ProductionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://neura-ops.onrender.com/api/v1/production-insights/product-insights',
                    {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                );
                setData(response.data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, description, suffix = '', status }: StatCardProps) => (
        <Card className="transition-all duration-200 hover:shadow-md">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium text-muted-foreground">{title}</div>
                    <div className={cn(
                        "p-2 rounded-full",
                        status === 'success' ? 'bg-green-500/10' :
                            status === 'warning' ? 'bg-amber-500/10' :
                                status === 'error' ? 'bg-red-500/10' :
                                    'bg-primary/10'
                    )}>
                        <Icon className={cn(
                            "h-5 w-5",
                            status === 'success' ? 'text-green-500' :
                                status === 'warning' ? 'text-amber-500' :
                                    status === 'error' ? 'text-red-500' :
                                        'text-primary'
                        )} />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className={cn(
                        "text-2xl font-bold",
                        status === 'success' ? 'text-green-500' :
                            status === 'warning' ? 'text-amber-500' :
                                status === 'error' ? 'text-red-500' :
                                    'text-foreground'
                    )}>
                        {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                    </h3>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const ProductCard = ({ insight }: { insight: ProductInsight }) => {
        const yieldValue = parseFloat(insight.yieldPercentage);
        const reworkValue = parseFloat(insight.reworkRatio);

        return (
            <Card className="overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h4 className="font-semibold flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                {insight.product.productName}
                            </h4>
                            <div className="text-sm text-muted-foreground mt-1">
                                SKU: {insight.product.productSKU} | Type: {insight.productType}
                            </div>
                        </div>
                        <Badge variant={insight.product.currentStock > insight.product.reorderPoint ? 'default' : 'destructive'}>
                            Stock: {insight.product.currentStock.toLocaleString()} {insight.product.uom}
                        </Badge>
                    </div>

                    <div className="grid gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="text-sm font-medium">Production</div>
                                <div className="text-2xl font-bold">{insight.totalUnitsProduced.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Total units produced</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium">Good Units</div>
                                <div className="text-2xl font-bold">{insight.goodUnitsWithoutRework.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Units without rework</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Yield Rate</span>
                                    <Badge variant={yieldValue >= 98 ? 'default' : 'destructive'}>
                                        {insight.yieldPercentage}%
                                    </Badge>
                                </div>
                                <Progress
                                    value={yieldValue}
                                    className={cn(
                                        "h-2",
                                        yieldValue >= 98 ? 'bg-green-500' :
                                        yieldValue >= 95 ? 'bg-amber-500' :
                                        'bg-red-500'
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Rework Rate</span>
                                    <Badge variant={reworkValue <= 2 ? 'default' : 'destructive'}>
                                        {insight.reworkRatio}%
                                    </Badge>
                                </div>
                                <Progress
                                    value={reworkValue}
                                    className={cn(
                                        "h-2",
                                        reworkValue <= 2 ? 'bg-green-500' :
                                        reworkValue <= 5 ? 'bg-amber-500' :
                                        'bg-red-500'
                                    )}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <div className="flex justify-between items-center">
                                <div className="text-sm font-medium">Production Cost</div>
                                <div className="text-sm font-semibold">
                                    ₹{parseFloat(insight.productionCost).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
                <p className="text-muted-foreground animate-pulse">Loading production data...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <Card className="border-destructive bg-destructive/5">
                <CardContent className="flex items-start gap-3 p-6">
                    <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-destructive">Failed to load data</h3>
                        <p className="text-sm text-destructive/90">
                            {error || 'Unable to retrieve production insights. Please try again later.'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const overallYield = parseFloat(data.overall.yieldPercentage);
    const overallRework = parseFloat(data.overall.reworkRatio);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold mb-2">Product Production Dashboard</h1>
            <p className="text-muted-foreground">Production and product insights metrics</p>     
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Production"
                    value={data.overall.totalUnitsProduced}
                    icon={Boxes}
                    description="Total units produced across all products"
                    status={data.overall.totalUnitsProduced > 0 ? 'success' : 'warning'}
                />
                <StatCard
                    title="Good Units"
                    value={data.overall.goodUnitsWithoutRework}
                    icon={CheckCircle2}
                    description="Units produced without requiring rework"
                    status="success"
                />
                <StatCard
                    title="Yield Rate"
                    value={data.overall.yieldPercentage}
                    icon={PackageCheck}
                    suffix="%"
                    description="Overall production yield percentage"
                    status={overallYield >= 98 ? 'success' : overallYield >= 95 ? 'warning' : 'error'}
                />
                <StatCard
                    title="Rework Rate"
                    value={data.overall.reworkRatio}
                    icon={RefreshCcw}
                    suffix="%"
                    description="Percentage of units requiring rework"
                    status={overallRework <= 2 ? 'success' : overallRework <= 5 ? 'warning' : 'error'}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Product Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        {data.insights.map((insight) => (
                            <ProductCard key={insight.product._id} insight={insight} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}