// import { useEffect, useState } from 'react';
// import axios from 'axios';

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
// import { Users, Clock, AlertTriangle, DollarSign } from 'lucide-react';

// interface ManualJobKPI {
//   manualLaborProductivity: number;
//   scrapPercent: number;
//   reworkPercent: number;
//   avgTimePerUnit: number;
//   totalCostImpact: number;
// }

// interface JobBreakdown extends ManualJobKPI {
//   manualJobId: string;
//   productId: string;
//   productType: string;
//   costImpact: number;
// }

// interface ManualJobData {
//   overall: ManualJobKPI;
//   breakdown: JobBreakdown[];
// }

// interface MetricCardProps {
//   title: string;
//   value: number;
//   icon: React.ElementType;
//   suffix?: string;
// }

// export default function ManualJobProductionInsights() {
//   const [data, setData] = useState<ManualJobData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get('https://neura-ops.onrender.com/api/v1/production-insights/manualjob-insights');
//         setData(response.data);
//         setError(null);
//       } catch (err) {
//         setError('Failed to fetch manual job insights');
//         console.error('Error:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const MetricCard = ({ title, value, icon: Icon, suffix = '' }: MetricCardProps) => (
//     <Card>
//       <CardContent className="flex items-center p-4">
//         <div className="bg-primary/10 p-2 rounded-full mr-3">
//           <Icon className="h-5 w-5 text-primary" />
//         </div>
//         <div>
//           <p className="text-sm font-medium text-muted-foreground">{title}</p>
//           <h3 className="text-xl font-bold">{value.toFixed(2)}{suffix}</h3>
//         </div>
//       </CardContent>
//     </Card>
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (error || !data) {
//     return (
//       <Card className="bg-destructive/10">
//         <CardContent className="flex items-center gap-2 p-4">
//           <AlertTriangle className="h-5 w-5 text-destructive" />
//           <p className="text-destructive">{error || 'Failed to load manual job insights'}</p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <MetricCard
//           title="Labor Productivity"
//           value={data.overall.manualLaborProductivity}
//           icon={Users}
//           suffix=" units/min"
//         />
//         <MetricCard
//           title="Average Time per Unit"
//           value={data.overall.avgTimePerUnit}
//           icon={Clock}
//           suffix=" mins"
//         />
//         <MetricCard
//           title="Total Cost Impact"
//           value={data.overall.totalCostImpact}
//           icon={DollarSign}
//           suffix=" ₹"
//         />
//         <Card>
//           <CardContent className="p-4">
//             <h4 className="text-sm font-medium text-muted-foreground mb-2">Quality Metrics</h4>
//             <div className="space-y-4">
//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Scrap Rate</span>
//                   <span>{data.overall.scrapPercent.toFixed(1)}%</span>
//                 </div>
//                 <Progress value={data.overall.scrapPercent} className="h-2" />
//               </div>
//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Rework Rate</span>
//                   <span>{data.overall.reworkPercent.toFixed(1)}%</span>
//                 </div>
//                 <Progress value={data.overall.reworkPercent} className="h-2" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Job Breakdown</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-4">
//             {data.breakdown.map((job, index) => (
//               <Card key={index} className="bg-muted/50">
//                 <CardContent className="p-4">
//                   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                     <div>
//                       <h4 className="font-medium">Job Details</h4>
//                       <p className="text-sm text-muted-foreground">ID: {job.manualJobId}</p>
//                       <p className="text-sm text-muted-foreground">Product: {job.productId} ({job.productType})</p>
//                     </div>
//                     <div>
//                       <h4 className="font-medium">Performance</h4>
//                       <p className="text-sm text-muted-foreground">
//                         Productivity: {job.manualLaborProductivity.toFixed(2)} units/min
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         Avg Time: {job.avgTimePerUnit.toFixed(2)} mins
//                       </p>
//                     </div>
//                     <div>
//                       <h4 className="font-medium">Quality & Cost</h4>
//                       <p className="text-sm text-muted-foreground">
//                         Scrap: {job.scrapPercent.toFixed(1)}% | Rework: {job.reworkPercent.toFixed(1)}%
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         Cost Impact: ₹{job.costImpact.toFixed(2)}
//                       </p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }






import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  DollarSign,
  Package,
  ArrowUp,
  ArrowDown,
  Boxes
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';


interface ManualJobKPI {
  manualLaborProductivity: number;
  scrapPercent: number;
  reworkPercent: number;
  avgTimePerUnit: number;
  totalCostImpact: number;
}

interface JobBreakdown extends ManualJobKPI {
  manualJobId: string;
  productId: string;
  productType: string;
  costImpact: number;
  totalOutput: number;
  totalScrap: number;
  totalRework: number;
  totalTime: number;
  totalCost: number;
}

interface ManualJobData {
  success: boolean;
  overall: ManualJobKPI;
  breakdown: JobBreakdown[];
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  suffix?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  description?: string;
  className?: string;
}

export default function ManualJobProductionInsights() {
  const [data, setData] = useState<ManualJobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://neura-ops.onrender.com/api/v1/production-insights/manualjob-insights',
          {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
        );
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch manual job insights');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    suffix = '', 
    trend,
    description,
    className 
  }: StatCardProps) => (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          <div className="p-2 rounded-full bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold">
              {value.toFixed(2)}{suffix}
            </h3>
            {trend && (
              <div className={cn(
                "flex items-center gap-0.5 text-sm font-medium",
                trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
              )}>
                {trend.direction === 'up' ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {trend.value.toFixed(1)}%
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const QualityIndicator = ({ value, label }: { value: number; label: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <Badge variant={value <= 5 ? 'default' : 'destructive'}>
          {value.toFixed(1)}%
        </Badge>
      </div>
      <Progress 
        value={value} 
        max={100}
        className={cn(
          "h-2",
          value <= 3 ? 'bg-green-500' :
          value <= 5 ? 'bg-amber-500' :
          'bg-red-500'
        )}
      />
    </div>
  );

  const JobCard = ({ job }: { job: JobBreakdown }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h4 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              {job.productType}
            </h4>
            <div className="text-sm text-muted-foreground mt-1">
              ID: {job.productId.slice(-8)}
            </div>
          </div>
          <Badge variant={job.manualLaborProductivity >= 8 ? 'default' : 'secondary'}>
            {job.manualLaborProductivity.toFixed(1)} units/min
          </Badge>
        </div>

        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Output</div>
              <div className="text-2xl font-bold">{job.totalOutput.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total units produced</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Time</div>
              <div className="text-2xl font-bold">{(job.totalTime / 60).toFixed(1)}h</div>
              <div className="text-xs text-muted-foreground">Total production time</div>
            </div>
          </div>

          <div className="space-y-3">
            <QualityIndicator value={job.scrapPercent} label="Scrap Rate" />
            <QualityIndicator value={job.reworkPercent} label="Rework Rate" />
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Cost Impact</div>
              <div className={cn(
                "text-sm font-semibold",
                job.costImpact <= 1 ? "text-green-500" : "text-red-500"
              )}>
                ₹{job.costImpact.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-2">Manual Job Dashboard</h1>
      <p className="text-muted-foreground">Production insights and manual job metrics</p>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        
        <StatCard
          title="Labor Productivity"
          value={data.overall.manualLaborProductivity}
          icon={Users}
          suffix=" units/min"
          trend={{ value: 2.5, direction: 'up' }}
          description="Average units produced per minute"
        />
        <StatCard
          title="Processing Time"
          value={data.overall.avgTimePerUnit}
          icon={Clock}
          suffix=" mins"
          trend={{ value: 1.2, direction: 'down' }}
          description="Average time per unit"
        />
        <StatCard
          title="Quality Rate"
          value={100 - (data.overall.scrapPercent + data.overall.reworkPercent)}
          icon={Boxes}
          suffix="%"
          description="First pass yield rate"
        />
        <StatCard
          title="Cost Impact"
          value={data.overall.totalCostImpact}
          icon={DollarSign}
          suffix=" ₹"
          description="Total cost impact on production"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Production Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {data.breakdown.map((job) => (
              <JobCard key={job.manualJobId + job.productId} job={job} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}