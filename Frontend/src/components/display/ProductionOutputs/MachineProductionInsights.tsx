import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';


import { Activity, ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


import { Settings, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import axios from 'axios';


type OverallPerformanceProps = {
  data: MachineKPI;
};

export function OverallPerformance({ data }: OverallPerformanceProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Activity className="h-5 w-5 text-primary" />
          Overall Factory Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* OEE Gauge */}
          <div className="flex flex-col items-center justify-center">
            <KpiGauge 
              value={data.oee}
              title="OEE Score"
              thresholds={{
                low: 65,
                medium: 80,
                high: 90
              }}
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Target: 85%</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {data.oee >= 85 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  data.oee >= 85 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {Math.abs(data.oee - 85).toFixed(1)}% {data.oee >= 85 ? 'above' : 'below'} target
                </span>
              </div>
            </div>
          </div>
          
          {/* Availability Gauge */}
          <div className="flex flex-col items-center justify-center">
            <KpiGauge 
              value={data.availability}
              title="Availability"
              thresholds={{
                low: 70,
                medium: 85,
                high: 95
              }}
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Scheduled: 85%</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {data.availability >= 85 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  data.availability >= 85 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {Math.abs(data.availability - 85).toFixed(1)}% {data.availability >= 85 ? 'above' : 'below'} schedule
                </span>
              </div>
            </div>
          </div>
          
          {/* Quality Gauge */}
          <div className="flex flex-col items-center justify-center">
            <KpiGauge 
              value={data.quality}
              title="Quality"
              thresholds={{
                low: 80,
                medium: 90,
                high: 98
              }}
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Standard: 99%</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {data.quality >= 99 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  data.quality >= 99 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {Math.abs(data.quality - 99).toFixed(1)}% {data.quality >= 99 ? 'above' : 'below'} standard
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


import { cn } from '@/lib/utils';

type KpiGaugeProps = {
  value: number;
  title: string;
  thresholds: {
    low: number;
    medium: number;
    high: number;
  };
  className?: string;
};

export function KpiGauge({ value, title, thresholds, className }: KpiGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  // Determine color based on thresholds
  const getColor = (val: number) => {
    if (val >= thresholds.high) return 'text-green-500';
    if (val >= thresholds.medium) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Calculate stroke dasharray for circle
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;
  
  // Animate the gauge on mount and when value changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [value]);
  
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className="relative w-40 h-40">
        {/* Background circle */}
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/15"
          />
          {/* Foreground circle that shows the value */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
            className={`transition-all duration-1000 ease-out ${getColor(animatedValue)}`}
          />
        </svg>
        
        {/* Value display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold transition-colors ${getColor(animatedValue)}`}>
            {animatedValue.toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground mt-1">{title}</span>
        </div>
      </div>
    </div>
  );
}



import { 
  BarChart3, 
  Clock, 
  DollarSign, 
  Gauge,
} from 'lucide-react';

type SummaryMetricsProps = {
  data: MachineKPI;
};

export function SummaryMetrics({ data }: SummaryMetricsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Overall OEE"
        value={data.oee}
        description="Overall Equipment Effectiveness"
        icon={Gauge}
        trend={{
          value: 5.2,
          label: "from last week",
          direction: "up"
        }}
        suffix="%"
        threshold={{
          good: 85,
          warning: 75
        }}
      />
      
      <StatCard
        title="Machine Performance"
        value={data.performance}
        description="Speed and productivity level"
        icon={BarChart3}
        trend={{
          value: -2.5,
          label: "from last week",
          direction: "down"
        }}
        suffix="%"
        threshold={{
          good: 90,
          warning: 80
        }}
      />
      
      <StatCard
        title="Downtime"
        value={data.downtimePercent > 100 ? 100 : data.downtimePercent}
        description="Unplanned stoppage time"
        icon={Clock}
        trend={{
          value: 1.8,
          label: "from last week", 
          direction: "up"
        }}
        suffix="%"
        threshold={{
          good: 5,
          warning: 10
        }}
        isInverse={true}
      />
      
      <StatCard
        title="Energy Cost"
        value={data.energyCostPerUnit}
        description="Cost per production unit"
        icon={DollarSign}
        trend={{
          value: -0.02,
          label: "from last week",
          direction: "down"
        }}
        suffix="₹"
        threshold={{
          good: 0.1,
          warning: 0.15
        }}
        isInverse={true}
        precision={3}
      />
    </div>
  );
}


type StatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType; // Changed from LucideIcon
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down';
  };
  suffix?: string;
  threshold?: {
    good: number;
    warning: number;
  };
  isInverse?: boolean;
  precision?: number;
  className?: string;
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  suffix = '%',
  threshold,
  isInverse = false,
  precision = 1,
  className,
}: StatCardProps) {
  const getStatusColor = () => {
    if (!threshold) return 'text-primary';
    
    if (isInverse) {
      // For metrics where lower is better (downtime, cost)
      if (value <= threshold.good) return 'text-green-600 dark:text-green-500';
      if (value <= threshold.warning) return 'text-amber-600 dark:text-amber-500';
      return 'text-red-600 dark:text-red-500';
    } else {
      // For metrics where higher is better (OEE, performance)
      if (value >= threshold.good) return 'text-green-600 dark:text-green-500';
      if (value >= threshold.warning) return 'text-amber-600 dark:text-amber-500';
      return 'text-red-600 dark:text-red-500';
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    if (isInverse) {
      // For metrics where lower is better
      return trend.direction === 'down' 
        ? 'text-green-600 dark:text-green-500' 
        : 'text-red-600 dark:text-red-500';
    } else {
      // For metrics where higher is better
      return trend.direction === 'up' 
        ? 'text-green-600 dark:text-green-500' 
        : 'text-red-600 dark:text-red-500';
    }
  };

  const formatValue = () => {
    if (suffix === '₹' || suffix === '$') {
      return `${suffix}${value.toFixed(precision)}`;
    }
    return `${value.toFixed(precision)}${suffix}`;
  };

  return (
    <Card className={cn("overflow-hidden transition-all duration-200 hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          <div className={cn(
            "p-2 rounded-full",
            `${getStatusColor().replace('text-', 'bg-')}/10`
          )}>
            <Icon className={cn("h-5 w-5", getStatusColor())} />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <h3 className={cn("text-2xl font-bold", getStatusColor())}>
              {formatValue()}
            </h3>
            {trend && (
              <div className={cn("flex items-center gap-0.5 text-sm font-medium", getTrendColor())}>
                {trend.direction === 'up' ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {trend.value.toFixed(precision)}
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">{description}</p>
          
          {trend && (
            <p className="text-xs text-muted-foreground">{trend.label}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


type MachineMetricsCardProps = {
  data: MachineKPI & { machineId: string };
  machineId: string;
};

export function MachineMetricsCard({ data, machineId }: MachineMetricsCardProps) {
  const [animateProgress, setAnimateProgress] = useState(false);
  
  // Determine machine status based on OEE
  const getMachineStatus = () => {
    if (data.oee >= 85) return 'optimal';
    if (data.oee >= 70) return 'good';
    if (data.oee >= 60) return 'attention';
    return 'critical';
  };
  
  // Status display configuration
  const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    optimal: { 
      label: 'Optimal', 
      className: 'bg-green-600/10 text-green-600 hover:bg-green-600/20',
      icon: <TrendingUp className="h-3 w-3 mr-1" />
    },
    good: { 
      label: 'Good', 
      className: 'bg-blue-600/10 text-blue-600 hover:bg-blue-600/20',
      icon: <Activity className="h-3 w-3 mr-1" />
    },
    attention: { 
      label: 'Needs Attention', 
      className: 'bg-amber-600/10 text-amber-600 hover:bg-amber-600/20',
      icon: <Activity className="h-3 w-3 mr-1" />
    },
    critical: { 
      label: 'Critical', 
      className: 'bg-red-600/10 text-red-600 hover:bg-red-600/20',
      icon: <TrendingDown className="h-3 w-3 mr-1" />
    }
  };
  
  const status = getMachineStatus();
  const statusData = statusConfig[status];
  
  // Trigger progress animation after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateProgress(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Extract machine type from ID (e.g., "EXT" from "EXT-003")
  const machineType = machineId.split('-')[0];
  
  // Map machine type to full name
  const machineTypeNames: Record<string, string> = {
    'EXT': 'Extruder',
    'INJ': 'Injection Molder',
    'BLW': 'Blow Molder',
    'CNC': 'CNC Machine',
    'ASM': 'Assembly Station'
  };
  
  const machineName = machineTypeNames[machineType] || 'Machine';
  
  return (
    <Card className={`shadow-sm border-l-4 transition-all duration-300 ${
      status === 'optimal' ? 'border-l-green-500' :
      status === 'good' ? 'border-l-blue-500' :
      status === 'attention' ? 'border-l-amber-500' :
      'border-l-red-500'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              {machineName} {machineId.split('-')[1]}
            </CardTitle>
            <span className="text-xs text-muted-foreground mt-1">ID: {machineId}</span>
          </div>
          <Badge className={statusData.className}>
            <span className="flex items-center">
              {statusData.icon}
              {statusData.label}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-5">
          {/* Main KPI metrics with labeled progress bars */}
          <div className="grid gap-y-4">
            <MetricProgress
              label="OEE"
              value={data.oee}
              animate={animateProgress}
              max={100}
              thresholds={{ low: 60, medium: 75, high: 85 }}
            />
            
            <MetricProgress
              label="Availability"
              value={data.availability}
              animate={animateProgress}
              max={100}
              thresholds={{ low: 70, medium: 85, high: 95 }}
            />
            
            <MetricProgress
              label="Performance"
              value={data.performance > 100 ? 100 : data.performance}
              animate={animateProgress}
              max={100}
              thresholds={{ low: 75, medium: 85, high: 95 }}
            />
            
            <MetricProgress
              label="Quality"
              value={data.quality}
              animate={animateProgress}
              max={100}
              thresholds={{ low: 80, medium: 90, high: 98 }}
            />
          </div>
          
          {/* Secondary metrics in a compact grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Downtime</span>
                <span className={`text-xs font-semibold ${
                  data.downtimePercent <= 5 ? 'text-green-600' :
                  data.downtimePercent <= 15 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {Math.min(data.downtimePercent, 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={Math.min(data.downtimePercent, 100)}
                max={100}
                className={`h-1.5 ${
                  data.downtimePercent <= 5 ? 'bg-green-600' :
                  data.downtimePercent <= 15 ? 'bg-amber-600' : 'bg-red-600'
                }`}
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Energy</span>
                <span className={`text-xs font-semibold ${
                  data.energyCostPerUnit <= 0.1 ? 'text-green-600' :
                  data.energyCostPerUnit <= 0.15 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  ₹{data.energyCostPerUnit.toFixed(3)}
                </span>
              </div>
              <Progress
                value={data.energyCostPerUnit * 500} // Scale for visibility
                max={100}
                className={`h-1.5 ${
                  data.energyCostPerUnit <= 0.1 ? 'bg-green-600' :
                  data.energyCostPerUnit <= 0.15 ? 'bg-amber-600' : 'bg-red-600'
                }`}
              />
            </div>
            
            <div className="col-span-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium">Cycle Time Util.</span>
                <span className={`font-semibold ${
                  data.cycleTimeUtilization <= 0.001 ? 'text-red-600' :
                  data.cycleTimeUtilization <= 0.002 ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {data.cycleTimeUtilization.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type MetricProgressProps = {
  label: string;
  value: number;
  max?: number;
  animate?: boolean;
  thresholds: {
    low: number;
    medium: number;
    high: number;
  };
};

function MetricProgress({ 
  label, 
  value, 
  max = 100, 
  animate = false,
  thresholds
}: MetricProgressProps) {
  const getColor = () => {
    if (value >= thresholds.high) return 'bg-green-600';
    if (value >= thresholds.medium) return 'bg-blue-600';
    if (value >= thresholds.low) return 'bg-amber-600';
    return 'bg-red-600';
  };
  
  const getTextColor = () => {
    if (value >= thresholds.high) return 'text-green-600';
    if (value >= thresholds.medium) return 'text-blue-600';
    if (value >= thresholds.low) return 'text-amber-600';
    return 'text-red-600';
  };
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm font-semibold ${getTextColor()}`}>
          {value.toFixed(1)}%
        </span>
      </div>
      <Progress 
        value={animate ? value : 0} 
        max={max}
        className={`h-2 transition-all duration-1000 ${getColor()}`}
      />
    </div>
  );
}


export interface MachineKPI {
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  downtimePercent: number;
  cycleTimeUtilization: number;
  energyCostPerUnit: number;
}

export interface MachineData {
  overall: MachineKPI;
  machineSpecific: (MachineKPI & { machineId: string })[];
}


// In a real application, this would use environment variables
const API_BASE_URL = 'https://neura-ops.onrender.com/api/v1';

// For development/demo purposes, we're returning mock data
// In production, this would make a real API call
export async function fetchMachineData(): Promise<MachineData> {
  try {
    // Uncomment for real API integration
    const response = await axios.get(`${API_BASE_URL}/production-insights/machine-insights`,
      {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
    );
    return response.data;

  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}


export default function MachineProductionInsights() {
  const [data, setData] = useState<MachineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const machineData = await fetchMachineData();
        // Normalize extreme values to display properly
        const normalizedData = normalizeDataValues(machineData);
        setData(normalizedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching machine data:', err);
        setError('Failed to fetch machine insights');
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  // Function to normalize data values with extreme numbers
  const normalizeDataValues = (data: MachineData): MachineData => {
    // Cap OEE and other metrics to reasonable values for display
    const normalizeKpi = (kpi: number) => Math.min(kpi, 100);
    
    const normalizeMachine = (machine: any) => ({
      ...machine,
      oee: normalizeKpi(machine.oee),
      availability: normalizeKpi(machine.availability),
      performance: normalizeKpi(machine.performance),
      quality: normalizeKpi(machine.quality),
      downtimePercent: Math.min(machine.downtimePercent, 100),
    });

    return {
      overall: normalizeMachine(data.overall),
      machineSpecific: data.machineSpecific.map(machine => normalizeMachine(machine))
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        <p className="text-muted-foreground animate-pulse">Loading machine data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="flex items-start gap-3 p-6">
          <AlertCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive">Failed to load data</h3>
            <p className="text-sm text-destructive/90">
              {error || 'Unable to retrieve machine insights. Please try again later.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort machines by OEE for consistent display
  const sortedMachines = [...data.machineSpecific].sort((a, b) => b.oee - a.oee);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

<h1 className="text-3xl font-bold mb-2">Manufacturing Dashboard</h1>
<p className="text-muted-foreground">Production insights and machine performance metrics</p>

      {/* Overall factory metrics summary */}
      <SummaryMetrics data={data.overall} />
      
      {/* Overall performance visualization */}
      <OverallPerformance data={data.overall} />
      
      {/* Individual machine metrics */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Machine Performance</h2>
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {sortedMachines.map((machine) => (
            <MachineMetricsCard
              key={machine.machineId}
              data={machine}
              machineId={machine.machineId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}