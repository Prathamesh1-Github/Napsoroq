import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface BreakEvenData {
    breakEvenUnits: number;
    currentProduction: number;
    percentageAboveBreakEven: string;
    status: string;
}

export function BreakEvenAnalysisCard() {
    const [data, setData] = useState<BreakEvenData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBreakEvenData = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                const response = await axios.get('https://neura-ops.onrender.com/api/v1/financecost/breakeven', {
                    headers: {
                        Authorization: "Bearer " + token
                    }
                });

                setData(response.data);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchBreakEvenData();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Break-even Analysis</CardTitle>
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
                    <CardTitle>Break-even Analysis</CardTitle>
                    <CardDescription>Error</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-red-500 text-sm">{error}</div>
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const progressValue = Math.min(200, 100 + parseFloat(data.percentageAboveBreakEven));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Break-even Analysis</CardTitle>
                <CardDescription>
                    Production volume vs. profitability
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-muted-foreground">Break-even Point</div>
                            <div className="text-2xl font-bold">{data.breakEvenUnits.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">units/month</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Current Production</div>
                            <div className="text-2xl font-bold">{data.currentProduction.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">units/month</div>
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <div className="mb-2 text-sm font-medium">Profitability Status</div>
                        <div className="flex items-center space-x-2">
                            {data.status === 'Above Break-even' ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            <div className="text-sm">
                                Production is{" "}
                                <span className={data.status === 'Above Break-even' ? "font-medium text-emerald-500" : "font-medium text-red-500"}>
                                    {parseFloat(data.percentageAboveBreakEven).toFixed(1)}%
                                </span>{" "}
                                {data.status.toLowerCase()}
                            </div>
                        </div>
                        <Progress value={progressValue} max={200} className="mt-3 h-2" />
                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <div>Break-even</div>
                            <div>Current</div>
                            <div>Target</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
