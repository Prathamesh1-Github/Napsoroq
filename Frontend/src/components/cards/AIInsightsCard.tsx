import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Columns } from 'lucide-react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  LineChart,
  Lightbulb,
  Settings,
  TrendingDown,
  TrendingUp,
  Zap,
  DollarSign,
  Users,
  Wrench,
  AlertCircle,
  Activity,
  PieChart,
  Gauge,
  Boxes,
  Truck
} from 'lucide-react';
import axios from 'axios';

export function AIInsightsCard({ refreshKey }: { refreshKey: number }) {
  const [activeInsight, setActiveInsight] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('realtime');

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <BarChart3 className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'efficiency':
        return <Settings className="h-5 w-5" />;
      case 'quality':
        return <Zap className="h-5 w-5" />;
      case 'maintenance':
        return <Wrench className="h-5 w-5" />;
      case 'process':
        return <Activity className="h-5 w-5" />;
      case 'logistics':
        return <Truck className="h-5 w-5" />;
      case 'energy':
        return <Zap className="h-5 w-5" />;
      case 'workforce':
        return <Users className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'text-destructive';
      case 'warning':
        return 'text-amber-500';
      case 'success':
        return 'text-emerald-500';
      default:
        return 'text-primary';
    }
  };

  const [insights, setInsights] = useState<{ [key: string]: any[] }>({});
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setError(null);

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
          setError('Failed to fetch AI insights. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [refreshKey]);

  console.log(error)


  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="realtime">
            <Activity className="mr-2 h-4 w-4" />
            Real-time Monitoring
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Brain className="mr-2 h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <LineChart className="mr-2 h-4 w-4" />
            Predictive Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Alerts</CardTitle>
                <CardDescription>Critical events requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea >
                  <div className="space-y-4">
                    {Array.isArray(insights.format_1) && insights.format_1.map((alert) => (
                      <div
                        key={alert.id}
                        className={`rounded-lg border p-4 ${alert.severity === 'critical'
                          ? 'border-red-500/50 bg-red-500/10'
                          : alert.severity === 'warning'
                            ? 'border-amber-500/50 bg-amber-500/10'
                            : 'border-blue-500/50 bg-blue-500/10'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {alert.severity === 'critical' ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : alert.severity === 'warning' ? (
                              <AlertTriangle className="h-5 w-5 text-amber-500" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-blue-500" />
                            )}
                            <div className="font-medium">{alert.title}</div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {alert.timestamp}
                          </span>
                        </div>
                        <p className="mt-2 text-sm">{alert.description}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          {alert.action}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Metrics</CardTitle>
                <CardDescription>Real-time performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Array.isArray(insights.format_2) && insights.format_2.map((single) => (
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{single.title}</span>
                        </div>
                        <div className="mt-2 text-2xl font-bold">
                          {single.metricValue}
                          <span className="text-sm font-normal text-muted-foreground">
                            {' '}
                            {single.unit}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <Columns className="h-4 w-4 text-indigo-500" />
                          <span className="text-muted-foreground">{single.comparativeInsight}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Boxes className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Current Batch</span>
                      </div>
                      <Badge variant="outline">In Progress</Badge>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completed</span>
                        <span>234/500 units</span>
                      </div>
                      <Progress value={46.8} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Started: 2h ago</span>
                        <span>ETA: 3h 15m</span>
                      </div>
                    </div>
                  </div> */}

                  {Array.isArray(insights.format_11) && insights.format_11.slice(0, 3).map((single) => (
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Boxes className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{single.batch}</span>
                        </div>
                        <Badge variant="outline">{single.status}</Badge>
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completed</span>
                          <span>{single.completedUnits}/{single.totalUnits}units</span>
                        </div>
                        <Progress value={46.8} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Started: {single.startedAgo}</span>
                          <span>ETA: {single.eta}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>AI-Generated Insights</CardTitle>
                <CardDescription>
                  Real-time analysis and recommendations for operational improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {Array.isArray(insights.format_1) && insights.format_7.map((insight) => (
                      <div
                        key={insight.id}
                        className={`rounded-lg border p-4 transition-colors hover:bg-muted/50 ${activeInsight === insight.id ? 'bg-muted' : ''
                          }`}
                        onClick={() => setActiveInsight(insight.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`rounded-full bg-primary/10 p-2 ${getSeverityColor(insight.severity)}`}>
                              {getInsightIcon(insight.type)}
                            </div>
                            <div>
                              <div className="font-medium">{insight.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {insight.metrics[0].value} vs {insight.metrics[0].target} target
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${getSeverityColor(insight.severity)} bg-${insight.severity}/10`}
                          >
                            {insight.severity === 'success' ? 'Optimized' : 'Needs Attention'}
                          </Badge>
                        </div>

                        {activeInsight === insight.id && (
                          <div className="mt-4 space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                              {insight.metrics.map((metric: any, index: number) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>{metric.name}</span>
                                    <span className={getSeverityColor(insight.severity)}>
                                      {metric.value}
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      typeof metric.value === 'string' && metric.value.includes('%')
                                        ? parseFloat(metric.value)
                                        : 75
                                    }
                                    className="h-2"
                                  />
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Target: {metric.target}</span>
                                    <div className="flex items-center gap-1">
                                      <span>{metric.trend}</span>
                                      {metric.status === 'above' ? (
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                      ) : (
                                        <TrendingDown className="h-4 w-4 text-destructive" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* <div className="rounded-lg border p-3 bg-muted/50">
                              <div className="font-medium mb-2">Expected Impact</div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">Financial</div>
                                  <div className="font-medium">{insight.impact.financial}</div>
                                </div>
                                {insight.impact.productivity && (
                                  <div>
                                    <div className="text-muted-foreground">Productivity</div>
                                    <div className="font-medium">{insight.impact.productivity}</div>
                                  </div>
                                )}
                                {insight.impact.efficiency && (
                                  <div>
                                    <div className="text-muted-foreground">Efficiency</div>
                                    <div className="font-medium">{insight.impact.efficiency}</div>
                                  </div>
                                )}
                                {insight.impact.quality && (
                                  <div>
                                    <div className="text-muted-foreground">Quality</div>
                                    <div className="font-medium">{insight.impact.quality}</div>
                                  </div>
                                )}
                                {insight.impact.availability && (
                                  <div>
                                    <div className="text-muted-foreground">Availability</div>
                                    <div className="font-medium">{insight.impact.availability}</div>
                                  </div>
                                )}
                                {insight.impact.sustainability && (
                                  <div>
                                    <div className="text-muted-foreground">Sustainability</div>
                                    <div className="font-medium">{insight.impact.sustainability}</div>
                                  </div>
                                )}
                                <div>
                                  <div className="text-muted-foreground">Timeframe</div>
                                  <div className="font-medium">{insight.impact.timeframe}</div>
                                </div>
                              </div>
                            </div> */}

                            <div className="space-y-2">
                              <div className="font-medium">AI Recommendations</div>
                              <ul className="space-y-2">
                                {insight.recommendations.map((recommendation: any, index: number) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <Lightbulb className="h-4 w-4 mt-1 text-primary" />
                                    <span className="text-sm">{recommendation}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <Button className="w-full">
                              View Detailed Analysis
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Analysis</CardTitle>
                <CardDescription>Projected benefits of recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-500" />
                      <div className="font-medium">Financial Impact</div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold text-emerald-500">+$248,000</div>
                      <p className="text-sm text-muted-foreground">
                        Projected annual savings
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      <div className="font-medium">Efficiency Gains</div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold text-blue-500">+18.5%</div>
                      <p className="text-sm text-muted-foreground">
                        Overall efficiency improvement
                      </p>
                    </div>
                  </div> */}

                  {Array.isArray(insights.format_12) && insights.format_12.slice(0,3).map((insight, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className={`h-5 w-5 text-${insight.color}-500`} />
                        <div className="font-medium">{insight.category}</div>
                      </div>
                      <div className="mt-2">
                        <div className={`text-2xl font-bold text-${insight.color}-500`}>{insight.value}</div>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))}


                  <Button className="w-full">
                    <PieChart className="mr-2 h-4 w-4" />
                    View Detailed ROI Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Advanced Predictions</CardTitle>
                <CardDescription>AI-powered forecasts and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.isArray(insights.format_8) && insights.format_8.map((insight, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <LineChart className={`h-5 w-5 text-${insight.color}-500`} />
                        <div className="font-medium">{insight.title}</div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{insight.metric}</span>
                          <span className={`text-${insight.color}-500`}>
                            {insight.value}
                          </span>
                        </div>
                        <Progress
                          value={insight.progress}
                          className="mt-2 h-2"
                        />
                        <p className="mt-2 text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>Long-term performance projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-primary" />
                      <div className="font-medium">Production Trend</div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Q4 2024 Forecast</span>
                        <span className="text-emerald-500">+12.5%</span>
                      </div>
                      <Progress value={85} className="mt-2 h-2" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Steady growth trajectory expected
                      </p>
                    </div>
                  </div> */}

                  {Array.isArray(insights.format_8) && insights.format_8.slice(0, 3).map((insight, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <LineChart className={`h-5 w-5 text-${insight.color}-500`} />
                        <div className="font-medium">{insight.title}</div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{insight.metric}</span>
                          <span className={`text-${insight.color}-500`}>
                            {insight.value}
                          </span>
                        </div>
                        <Progress
                          value={insight.progress}
                          className="mt-2 h-2"
                        />
                        <p className="mt-2 text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-primary" />
                      <div className="font-medium">Capacity Utilization</div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Next Quarter</span>
                        <span className="text-amber-500">92%</span>
                      </div>
                      <Progress value={92} className="mt-2 h-2" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Approaching maximum capacity
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-5 w-5 text-primary" />
                      <div className="font-medium">Maintenance Forecast</div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Next 30 Days</span>
                        <span className="text-blue-500">3 Events</span>
                      </div>
                      <Progress value={65} className="mt-2 h-2" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Scheduled maintenance optimization
                      </p>
                    </div>
                  </div> */}

                  <Button className="w-full">
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Forecast Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}