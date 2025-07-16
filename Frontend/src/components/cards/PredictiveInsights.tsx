'use client';

import { useEffect, useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import axios from 'axios';

interface PredictiveInsight {
    title: string;
    prediction: string;
    confidence: number;
    action: string;
}

interface InsightsResponse {
    format_9: PredictiveInsight[];
}

export default function PredictiveInsights({ refreshKey }: { refreshKey: number }) {
    const [insights, setInsights] = useState<InsightsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInsights() {
            try {
                const response = await axios.get(
                    'https://neura-ops.onrender.com/api/v1/ai/latest-airesponse',
                    {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem('token'),
                        },
                    }
                );
                if (response.data && response.data.success && response.data.data) {
                    setInsights(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching predictive insights:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchInsights();
    }, [refreshKey]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
                <CardDescription>
                    AI forecasts and trend analysis
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-sm text-muted-foreground">Loading insights...</div>
                ) : (
                    <div className="space-y-4">
                        {insights?.format_9?.slice(0, 3).map((insight: PredictiveInsight, i: number) => (
                            <div key={i} className="rounded-lg border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-primary" />
                                    <div className="font-medium">{insight.title}</div>
                                </div>
                                <div className="mt-2 text-sm">{insight.prediction}</div>
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="text-xs text-muted-foreground">
                                        Confidence: {insight.confidence}%
                                    </div>
                                    <Badge variant="outline" className="bg-primary/10 text-primary">
                                        AI Prediction
                                    </Badge>
                                </div>
                                <Separator className="my-3" />
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <div className="text-sm font-medium">Recommended Action:</div>
                                </div>
                                <div className="mt-1 text-sm">{insight.action}</div>
                                <Button variant="outline" size="sm" className="mt-3 w-full">
                                    Apply Recommendation
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
