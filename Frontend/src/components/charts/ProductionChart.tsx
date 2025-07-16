import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface ProductionData {
  day?: string;
  week?: string;
  production: number;
  target: number;
  defects: number;
}

export function ProductionChart() {
  const [timeframe, setTimeframe] = useState('daily');
  const [dailyData, setDailyData] = useState<ProductionData[]>([]);
  const [weeklyData, setWeeklyData] = useState<ProductionData[]>([]);

  const token = localStorage.getItem('token');

  const fetchDailyData = async () => {
    try {
      const response = await fetch('https://neura-ops.onrender.com/api/v1/production/chart/daily', {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
      if (response.ok) {
        const data = await response.json();
        setDailyData(data);
      }
    } catch (error) {
      console.error('Error fetching daily data:', error);
      // Fallback data
      setDailyData([
        { day: 'Mon', production: 3250, target: 3600, defects: 48 },
        { day: 'Tue', production: 3420, target: 3600, defects: 52 },
        { day: 'Wed', production: 3380, target: 3600, defects: 45 },
        { day: 'Thu', production: 3510, target: 3600, defects: 50 },
        { day: 'Fri', production: 3620, target: 3600, defects: 55 },
        { day: 'Sat', production: 2850, target: 3000, defects: 38 },
        { day: 'Sun', production: 2100, target: 2400, defects: 25 },
      ]);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      const response = await fetch('https://neura-ops.onrender.com/api/v1/production/chart/weekly', 
        {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  }
      );
      if (response.ok) {
        const data = await response.json();
        setWeeklyData(data);
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      // Fallback data
      setWeeklyData([
        { week: 'Week 1', production: 22500, target: 24000, defects: 320 },
        { week: 'Week 2', production: 23100, target: 24000, defects: 345 },
        { week: 'Week 3', production: 23800, target: 24000, defects: 310 },
        { week: 'Week 4', production: 24200, target: 24000, defects: 290 },
      ]);
    }
  };

  useEffect(() => {
    if (timeframe === 'daily') {
      fetchDailyData();
    } else if (timeframe === 'weekly') {
      fetchWeeklyData();
    }
  }, [timeframe]);

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <Tabs defaultValue="daily" onValueChange={setTimeframe} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="daily" className="mt-2">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={dailyData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorDefects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    borderColor: '#E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#374151'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="production" 
                  stroke="#3B82F6" 
                  fillOpacity={1}
                  fill="url(#colorProduction)" 
                  strokeWidth={2}
                  name="Production"
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10B981" 
                  fillOpacity={0}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target"
                />
                <Area 
                  type="monotone" 
                  dataKey="defects" 
                  stroke="#EF4444" 
                  fillOpacity={0.2}
                  fill="url(#colorDefects)" 
                  strokeWidth={2}
                  name="Defects"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-2">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={weeklyData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorDefects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    borderColor: '#E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#374151'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="production" 
                  stroke="#3B82F6" 
                  fillOpacity={1}
                  fill="url(#colorProduction)" 
                  strokeWidth={2}
                  name="Production"
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10B981" 
                  fillOpacity={0}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target"
                />
                <Area 
                  type="monotone" 
                  dataKey="defects" 
                  stroke="#EF4444" 
                  fillOpacity={0.2}
                  fill="url(#colorDefects)" 
                  strokeWidth={2}
                  name="Defects"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}