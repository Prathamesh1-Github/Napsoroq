export interface FinancialImpact {
    Type: string;
    Quantifiable_Value: string;
    Calculation_Basis: string;
}

export interface CrossLinkImpact {
    Module: string;
    Impact_Description: string;
}

export interface AIInsight {
    Insight_Title: string;
    Affected_Modules: string;
    Insight_Category: string;
    Insight_Level: string;
    Problem_Detected: string;
    Root_Cause_Analysis: string;
    AI_Recommendation_Action_Plan: string;
    Financial_Efficiency_Impact: FinancialImpact;
    Risk_Level: string;
    Time_Horizon: string;
    Cross_Link_Impact: CrossLinkImpact[];
    Scenario_Modeling_Suggestion: string;
    Confidence_Score: string;
    Justification_for_Recommendation: string;
    Action_Automation_Potential: string;
}

export interface APIResponse {
    success: boolean;
    data: {
        format_0: AIInsight[];
        response?: string;
        createdAt?: string;
        __v?: number;
    };
}


import { Loader2, Brain } from 'lucide-react';

export function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center h-96 rounded-2xl border border-border bg-gradient-to-br from-gray-50 to-white shadow-sm">
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 animate-pulse"></div>
                </div>
                <div className="relative z-10 h-20 w-20 rounded-full bg-card shadow-lg flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <div className="flex items-center gap-2 justify-center mb-2">
                    <Brain className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-foreground">AI Analysis in Progress</h3>
                </div>
                <p className="text-muted-foreground font-medium">Processing your business data...</p>
                <p className="text-gray-400 text-sm">This usually takes 10-30 seconds</p>
            </div>
            <div className="mt-6 w-48 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
        </div>
    );
}

import { Sparkles } from 'lucide-react';

export function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-96 rounded-2xl border border-border bg-gradient-to-br from-gray-50 to-white shadow-sm text-center px-6">
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100"></div>
                </div>
                <div className="relative z-10 h-20 w-20 rounded-full bg-card shadow-lg flex items-center justify-center">
                    <Brain className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-yellow-400 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                </div>
            </div>
            <div className="space-y-3 max-w-md">
                <h3 className="text-xl font-semibold text-foreground">No AI Insights Available</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Your AI assistant is ready to analyze your business data and provide intelligent insights.
                    Run your first analysis to get started.
                </p>
            </div>
            <button className="mt-8 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Insights
            </button>
        </div>
    );
}

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    message: string;
    onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-96 rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white shadow-sm text-center px-6">
            <div className="relative mb-6">
                <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
            </div>
            <div className="space-y-3 max-w-md">
                <h3 className="text-xl font-semibold text-foreground">Unable to Load Insights</h3>
                <p className="text-muted-foreground leading-relaxed">{message}</p>
                <p className="text-sm text-gray-500">
                    Please check your connection and try again, or contact support if the issue persists.
                </p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-8 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </button>
            )}
        </div>
    );
}

import { AlertCircle, CheckCircle, Shield } from 'lucide-react';

interface RiskBadgeProps {
    riskLevel: string;
}

export function RiskBadge({ riskLevel }: RiskBadgeProps) {
    const level = riskLevel.toLowerCase();

    if (level.includes('critical')) {
        return (
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1.5 shadow-sm">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Critical</span>
            </div>
        );
    }

    if (level.includes('high')) {
        return (
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1.5 shadow-sm">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>High</span>
            </div>
        );
    }

    if (level.includes('medium')) {
        return (
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200 flex items-center gap-1.5 shadow-sm">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Medium</span>
            </div>
        );
    }

    return (
        <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Low</span>
        </div>
    );
}

import { TrendingUp, DollarSign, Zap } from 'lucide-react';

interface CategoryBadgeProps {
    category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
    const getCategory = (cat: string) => {
        const lowerCat = cat.toLowerCase();

        if (lowerCat.includes('loss')) {
            return {
                icon: AlertTriangle,
                color: 'bg-red-100 text-red-700 border-red-200',
                label: 'Loss Alert'
            };
        }

        if (lowerCat.includes('efficiency')) {
            return {
                icon: Zap,
                color: 'bg-blue-100 text-blue-700 border-blue-200',
                label: 'Efficiency'
            };
        }

        if (lowerCat.includes('risk')) {
            return {
                icon: Shield,
                color: 'bg-orange-100 text-orange-700 border-orange-200',
                label: 'Risk'
            };
        }

        if (lowerCat.includes('costing')) {
            return {
                icon: DollarSign,
                color: 'bg-green-100 text-green-700 border-green-200',
                label: 'Costing'
            };
        }

        return {
            icon: TrendingUp,
            color: 'bg-purple-100 text-purple-700 border-purple-200',
            label: category
        };
    };

    const { icon: Icon, color, label } = getCategory(category);

    return (
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 shadow-sm ${color}`}>
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
        </div>
    );
}

interface ModuleBadgeProps {
    modules: string;
}

export function ModuleBadge({ modules }: ModuleBadgeProps) {
    // const moduleList = modules.split(',').map(m => m.trim());

    const moduleList =
        Array.isArray(modules)
            ? modules
            : (modules ?? '').split(',').map(m => m.trim()).filter(Boolean);


    const getModuleColor = (index: number) => {
        const colors = [
            'bg-blue-50 text-blue-700 border-blue-200',
            'bg-purple-50 text-purple-700 border-purple-200',
            'bg-pink-50 text-pink-700 border-pink-200',
            'bg-indigo-50 text-indigo-700 border-indigo-200',
            'bg-teal-50 text-teal-700 border-teal-200',
            'bg-amber-50 text-amber-700 border-amber-200',
            'bg-cyan-50 text-cyan-700 border-cyan-200',
            'bg-emerald-50 text-emerald-700 border-emerald-200',
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="flex flex-wrap gap-2">
            {moduleList.map((module, index) => (
                <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center ${getModuleColor(index)}`}
                >
                    {module}
                </span>
            ))}
        </div>
    );
}

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Target, Users } from 'lucide-react';

interface InsightCardProps {
    insight: AIInsight;
}

export function InsightCard({ insight }: InsightCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div
                className="p-6 cursor-pointer group"
                onClick={toggleExpand}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-200">
                            <Brain className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="space-y-3 flex-1 min-w-0">
                            <div className="flex items-start gap-3 flex-wrap">
                                <h3 className="font-semibold text-foreground text-lg leading-tight">
                                    {insight.Insight_Title}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <RiskBadge riskLevel={insight.Risk_Level} />
                                    <CategoryBadge category={insight.Insight_Category} />
                                </div>
                            </div>
                            <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                                {insight.Problem_Detected}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{insight.Time_Horizon}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Target className="h-4 w-4" />
                                    <span>{insight.Confidence_Score} confidence</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl h-10 w-10 flex items-center justify-center bg-muted group-hover:bg-muted transition-colors">
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="px-6 pb-6 pt-0 border-t border-gray-50 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    <div className="grid gap-6 mt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                        <Users className="h-4 w-4 text-indigo-600" />
                                        Affected Modules
                                    </h4>
                                    <ModuleBadge modules={insight.Affected_Modules} />
                                </div>

                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Root Cause Analysis</h4>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {insight.Root_Cause_Analysis}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        Financial Impact
                                    </h4>
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium text-green-800 bg-green-100 px-2 py-1 rounded-full">
                                                {insight.Financial_Efficiency_Impact.Type}
                                            </span>
                                        </div>
                                        <p className="text-green-900 font-semibold text-lg">
                                            {insight.Financial_Efficiency_Impact.Quantifiable_Value}
                                        </p>
                                        <p className="text-green-700 text-sm mt-1">
                                            {insight.Financial_Efficiency_Impact.Calculation_Basis}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* <div>
                                    <h4 className="font-semibold text-foreground mb-2">Recommended Actions</h4>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <p className="text-blue-900 leading-relaxed text-sm">
                                            {insight.AI_Recommendation_Action_Plan}
                                        </p>
                                    </div>
                                </div> */}

                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Recommended Actions</h4>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                                        {Array.isArray(insight.AI_Recommendation_Action_Plan) && insight.AI_Recommendation_Action_Plan.map((item, i) => {
                                            // Handle if item is a string
                                            if (typeof item === 'string') {
                                                return (
                                                    <div key={i} className="text-blue-900 leading-relaxed text-sm">
                                                        • {item}
                                                    </div>
                                                );
                                            }
                                            // Handle if item is an object with step and rationale
                                            if (item && typeof item === 'object' && 'step' in item && 'rationale' in item) {
                                                return (
                                                    <div key={i} className="space-y-1">
                                                        <div className="font-medium text-blue-900 text-sm">
                                                            • {item.step}
                                                        </div>
                                                        <div className="text-blue-700 text-xs">
                                                            {item.rationale}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                        {!Array.isArray(insight.AI_Recommendation_Action_Plan) && (
                                            <div className="text-blue-900 leading-relaxed text-sm">
                                                {insight.AI_Recommendation_Action_Plan}
                                            </div>
                                        )}
                                    </div>
                                </div>


                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Cross-Module Impact</h4>
                                    <div className="space-y-2">
                                        {insight.Cross_Link_Impact.map((impact, i) => (
                                            <div key={i} className="bg-muted border border-gray-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium text-foreground bg-muted px-2 py-1 rounded-full">
                                                        {impact.Module}
                                                    </span>
                                                </div>
                                                <p className="text-muted-foreground text-sm">
                                                    {impact.Impact_Description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Automation Potential</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${insight.Action_Automation_Potential.toLowerCase().includes('high')
                                            ? 'bg-green-100 text-green-800'
                                            : insight.Action_Automation_Potential.toLowerCase().includes('medium')
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-muted text-gray-800'
                                            }`}>
                                            {insight.Action_Automation_Potential}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <h4 className="font-semibold text-amber-900 mb-2">Scenario Modeling</h4>
                            <p className="text-amber-800 text-sm leading-relaxed">
                                {insight.Scenario_Modeling_Suggestion}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



import { useEffect } from 'react';
import axios from 'axios';
import { Eye } from 'lucide-react';

export default function AiResponseCard({ refreshKey }: { refreshKey: number }) {
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showAll, setShowAll] = useState<boolean>(false);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get<APIResponse>(
                'https://neura-ops.onrender.com/api/v1/ai/latest-airesponse',
                {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token'),
                    },
                }
            );

            if (response.data && response.data.success && response.data.data?.format_0) {
                setInsights(response.data.data.format_0);
            } else {
                setError('AI response format is invalid');
            }
        } catch (err) {
            console.error('Error fetching AI insights:', err);
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setError('Authentication failed. Please log in again.');
                } else if (err.response?.status === 404) {
                    setError('AI insights service not found. Please contact support.');
                } else {
                    setError(err.response?.data?.message || 'Failed to fetch AI insights');
                }
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, [refreshKey]);

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchInsights} />;
    }

    if (!insights || insights.length === 0) {
        return <EmptyState />;
    }

    const displayedInsights = showAll ? insights : insights.slice(0, 3);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">AI Business Insights</h2>
                        <p className="text-muted-foreground text-sm">
                            {insights.length} insights generated from your business data
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            <div className="grid gap-6">
                {displayedInsights.map((insight) => (
                    <InsightCard
                        key={insight.Insight_Title}
                        insight={insight}
                    />
                ))}
            </div>

            {insights.length > 3 && (
                <div className="text-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-primary bg-muted border border-border rounded-xl hover:bg-muted/80 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <Eye className="h-4 w-4" />
                        {showAll ? 'Show Less' : `View All ${insights.length} Insights`}
                    </button>
                </div>
            )}
        </div>
    );
}

