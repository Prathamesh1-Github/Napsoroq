'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import axios from 'axios';

interface RiskInsight {
    risk: string;
    probability: 'Low' | 'Medium' | 'High';
    impact: 'Low' | 'Medium' | 'High';
    description: string;
}

export default function RiskAssessment({ refreshKey }: { refreshKey: number }) {
    const [risks, setRisks] = useState<RiskInsight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRisks() {
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
                    setRisks(response.data.data.format_10 || []);
                }
            } catch (error) {
                console.error('Error fetching risk assessment insights:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchRisks();
    }, [refreshKey]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>
                    AI-identified operational risks
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-sm text-muted-foreground">Loading risk insights...</div>
                ) : (
                    <div className="space-y-4">
                        {Array.isArray(risks) && risks.slice(0, 3).map((risk, i) => (
                            <div key={i} className="rounded-lg border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                                    <div className="font-medium">{risk.risk}</div>
                                </div>
                                <div className="mt-2 text-sm">{risk.description}</div>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <div className="text-xs text-muted-foreground">Probability:</div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                risk.probability === "Low"
                                                    ? "bg-emerald-500/10 text-emerald-500"
                                                    : risk.probability === "Medium"
                                                        ? "bg-amber-500/10 text-amber-500"
                                                        : "bg-red-500/10 text-red-500"
                                            }
                                        >
                                            {risk.probability}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="text-xs text-muted-foreground">Impact:</div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                risk.impact === "Low"
                                                    ? "bg-emerald-500/10 text-emerald-500"
                                                    : risk.impact === "Medium"
                                                        ? "bg-amber-500/10 text-amber-500"
                                                        : "bg-red-500/10 text-red-500"
                                            }
                                        >
                                            {risk.impact}
                                        </Badge>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="mt-3 w-full">
                                    View Mitigation Plan
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
