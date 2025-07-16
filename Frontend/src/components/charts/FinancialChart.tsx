import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ChartDataItem = { [key: string]: string | number };

type ApiResponse = {
  monthly: ChartDataItem[];
  quarterly: ChartDataItem[];
  yearly: ChartDataItem[];
};

export function FinancialChart() {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>(
    'monthly'
  );
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      try {
        const res = await fetch('https://neura-ops.onrender.com/api/v1/invoice/chart-data', {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
        const json: ApiResponse = await res.json();

        if (timeframe === 'monthly') setData(json.monthly);
        else if (timeframe === 'quarterly') setData(json.quarterly);
        else setData(json.yearly);
      } catch (error) {
        console.error('Failed to fetch chart data', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchChartData();
  }, [timeframe]);

  // Determine xAxis key based on timeframe
  const xAxisKey =
    timeframe === 'monthly' ? 'month' : timeframe === 'quarterly' ? 'quarter' : 'year';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <Tabs defaultValue="monthly" onValueChange={(value) => setTimeframe(value as 'monthly' | 'quarterly' | 'yearly')} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={timeframe} className="mt-2">
            {loading ? (
              <div className="text-center p-10 text-muted-foreground">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey={xAxisKey}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                    tickFormatter={(value) =>
                      timeframe === 'yearly'
                        ? `$${value / 1000000}M`
                        : `$${value / 1000}k`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      fontSize: '12px',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                    formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
