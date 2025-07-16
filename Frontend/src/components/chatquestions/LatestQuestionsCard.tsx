import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import {
    MessageSquare,
    Clock,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Eye,
    Calendar
} from 'lucide-react';

interface Question {
    id: string;
    question: string;
    answer?: string;
    status: 'pending' | 'answered';
    timestamp: Date;
}

interface LatestQuestionsCardProps {
    refreshKey?: number;
}

export function LatestQuestionsCard({ refreshKey }: LatestQuestionsCardProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLatestQuestions = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            const response = await fetch('https://neura-ops.onrender.com/api/v1/chat/latest-questions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch questions');
            }

            const data = await response.json();
            setQuestions(data.questions || []);
        } catch (err) {
            console.error('Error fetching questions:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestQuestions();
    }, [refreshKey]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'answered':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-200';
            case 'pending':
                return 'bg-amber-500/10 text-amber-500 border-amber-200';
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'answered':
                return <CheckCircle className="h-3 w-3" />;
            case 'pending':
                return <Clock className="h-3 w-3" />;
            default:
                return <AlertCircle className="h-3 w-3" />;
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Latest Q&A</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Recent questions and AI responses
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchLatestQuestions}
                        disabled={loading}
                        className="h-8 w-8"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <ScrollArea className="h-[900px]">
                    <div className="space-y-3">
                        {loading && questions.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Loading questions...</span>
                                </div>
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="rounded-full bg-muted/50 p-3 mb-3">
                                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-foreground">No questions yet</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Start asking questions to see them here
                                </p>
                            </div>
                        ) : (
                            questions.map((question) => (
                                <div key={question.id} className="border rounded-lg p-4 space-y-3 bg-card hover:bg-muted/20 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground leading-relaxed">
                                                {question.question}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="text-xs">
                                                        {format(question.timestamp, 'MMM dd, yyyy')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span className="text-xs">
                                                        {format(question.timestamp, 'HH:mm')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs shrink-0 ${getStatusColor(question.status)}`}
                                        >
                                            {getStatusIcon(question.status)}
                                            <span className="ml-1 capitalize">{question.status}</span>
                                        </Badge>
                                    </div>

                                    {question.answer && (
                                        <div className="bg-muted/30 rounded-md p-3 border-l-2 border-primary/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Eye className="h-3 w-3 text-primary" />
                                                <span className="text-xs font-medium text-primary">AI Response</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {question.answer}
                                            </p>
                                        </div>
                                    )}

                                    {question.status === 'pending' && (
                                        <div className="bg-amber-50 rounded-md p-3 border border-amber-200">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-amber-600" />
                                                <span className="text-xs font-medium text-amber-700">
                                                    Answer will be provided in the next insight generation
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}