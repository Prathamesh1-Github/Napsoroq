import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  ArrowUp,
  CircleDollarSign,
  LineChart,
  Package,
  Percent,
  RefreshCw,
  Sparkles,
  Zap,
  Settings,
} from 'lucide-react';
import { ProductionChart } from '@/components/charts/ProductionChart';
import { InventoryChart } from '@/components/charts/InventoryChart';
import { FinancialChart } from '@/components/charts/FinancialChart';
import { AIInsightsCard } from '@/components/cards/AIInsightsCard';
import { ChatAssistant } from '@/components/ChatAssistant';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { ReorderAlerts } from './cards/ReorderAlerts';
import MaterialUsage from './cards/MaterialUsage';
import { SalesAndOrder } from './dashboard/SalesAndOrder';
import { EOQAnalysisCard } from './cards/EOQAnalysisCard';

import CostBreakdown from './cards/CostBreakdown';
import AiResponseCard from './cards/AiResponseCard';
import Chat from './chatquestions/Chat';
import PredictiveInsights from './cards/PredictiveInsights';
import RiskAssessment from './cards/RiskAssessment';
import { BreakEvenAnalysisCard } from './cards/BreakEvenAnalysisCard';
import { FinancialSummaryCard } from './cards/FinancialSummaryCard';
import { Loader2 } from "lucide-react";
import { LatestQuestionsCard } from './chatquestions/LatestQuestionsCard';

interface ProductionData {
  plannedProductionTime: number;
  actualProductionTime: number;
  totalUnitsProduced: number;
  goodUnitsProduced: number;
  goodUnitsWithoutRework: number;
  scrapUnits: number;
  idealCycleTime: number;
  totalDowntime: number;
  totalTimeTaken: number;
  changeoverTime: number;
  actualMachineRunTime: number;
  availableMachineTime: number;
  maxProductionCapacity: number;
}

interface MachineMetrics {
  machineId: string;
  defectRate: string;
  reworkRate: string;
  fpy: string;
  productionRate: string;
}

interface OverallMetrics {
  defectRate: string;
  reworkRate: string;
  fpy: string;
  productionRate: string;
  oee: string;
}

// Define machine-specific efficiency metrics
interface MachineEfficiencyMetrics {
  machineId: string;
  oeeEfficiency: string;
  machineUtilizationEfficiency: string;
  productionEfficiency: string;
}

// Define overall efficiency metrics
interface OverallEfficiencyMetrics {
  oeeEfficiency: string;
  machineUtilizationEfficiency: string;
  productionEfficiency: string;
}

// Add missing type definitions for API responses
interface OeeAndProductionData {
  oee: number;
  productionRate: number;
}

interface InventoryAndCostData {
  inventoryStatus: {
    percentHealthy: number;
    belowReorderPoint: number;
    message: string;
  };
  costPerUnit: {
    averageCost: number;
    message: string;
  };
}

interface MachineStatus {
  name: string;
  status: string;
  uptime: string;
  alert: boolean;
  issues?: string[];
}

interface LossInsightsData {
  topDowntime: Array<{
    machineId: string;
    totalDowntime: number;
  }>;
  topScrap: Array<{
    productName: string;
    scrapUnits: number;
  }>;
  lowOEE: Array<{
    machineId: string;
    oee: number;
  }>;
  materialDeviation: Array<{
    productName: string;
    diffPercent: number;
  }>;
}

export default function Dashboard() {

  const [showChat, setShowChat] = useState(false);

  const [data, setData] = useState<ProductionData[]>([]);

  const [oeeScore, setOeeScore] = useState<number | null>(null);

  const [productionRate, setProductionRate] = useState<number | null>(null);


  const [oeeandproduction, setOeeandProduction] = useState<OeeAndProductionData | null>(null);
  const [inventoryandcost, setInventoryandCost] = useState<InventoryAndCostData | null>(null);

  const [machines, setMachines] = useState<MachineStatus[]>([]);


  const [lossInsights, setLossInsights] = useState<LossInsightsData | null>(null);

  useEffect(() => {
    const fetchLossInsights = async () => {
      try {
        const res = await axios.get("https://neura-ops.onrender.com/api/v1/production/loss-insights", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        setLossInsights(res.data);
      } catch (error) {
        console.error("Error loading production insights", error);
      }
    };

    fetchLossInsights();
  }, []);

  useEffect(() => {
    const fetchMachineStatus = async () => {
      try {
        const res = await axios.get("https://neura-ops.onrender.com/api/v1/machine/status",
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        ); // API endpoint
        setMachines(res.data.machines);
      } catch (err) {
        console.error("Failed to fetch machine status:", err);
      }
    };

    fetchMachineStatus();
  }, []);

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "Optimal":
        return "bg-green-500/10 text-green-500";
      case "Underperforming":
        return "bg-red-500/10 text-red-500";
      case "Maintenance Due":
        return "bg-blue-500/10 text-blue-500";
      case "Unstable":
        return "bg-amber-500/10 text-amber-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getProgressColor = (uptime: string) => {
    const value = parseFloat(uptime);
    if (isNaN(value)) return "bg-muted/30";
    if (value >= 85) return "bg-green-500/20";
    if (value >= 70) return "bg-amber-500/20";
    return "bg-red-500/20";
  };


  const getProductionData = async (): Promise<ProductionData[]> => {
    try {
      const response = await axios.get<{ productions: ProductionData[] }>(
        'https://neura-ops.onrender.com/api/v1/production/average',
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        }
      );

      // ✅ Extract only the `productions` array
      return response.data.productions;
    } catch (error) {
      console.error("Error fetching production data:", error);
      throw error;
    }
  };


  useEffect(() => {
    const fetchOeeAndProduction = async () => {
      try {
        console.log("called");
        const response = await axios.get(
          "https://neura-ops.onrender.com/api/v1/production/oeeandproduction",
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );

        console.log(response.data);
        setOeeandProduction(response.data);
      } catch (error) {
        console.error("Error fetching OEE and production data:", error);
      }
    };

    fetchOeeAndProduction();
  }, []);



  useEffect(() => {
    const fetchInventoryandCost = async () => {
      try {
        const response = await axios.get(
          "https://neura-ops.onrender.com/api/v1/production/inventoryandcost",
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );

        console.log(response.data);
        setInventoryandCost(response.data);
      } catch (error) {
        console.error("Error fetching OEE and production data:", error);
      }
    };

    fetchInventoryandCost();
  }, []);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getProductionData();
        console.log("Fetched Data:", result); // ✅ Debugging log
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data");
      }
    };
    fetchData();
  }, []);



  const calculateMetrics = (index: number) => {
    if (data.length === 0 || index >= data.length) return { oee: 0, productionRate: 0 };

    const production = data[index]; // Use the provided index
    console.log(production);

    const {
      availableMachineTime,
      totalDowntime,
      actualMachineRunTime,
      idealCycleTime,
      goodUnitsProduced,
      totalUnitsProduced,
      totalTimeTaken,
    } = production;


    let oee = 0;
    let productionRate = 0;

    // ✅ Calculate OEE Score
    if (availableMachineTime > 0 && idealCycleTime > 0 && totalUnitsProduced > 0) {
      const availability = ((availableMachineTime - totalDowntime) / availableMachineTime) * 100;
      const performance = ((idealCycleTime * goodUnitsProduced) / actualMachineRunTime) * 100;
      const quality = (goodUnitsProduced / totalUnitsProduced) * 100;
      oee = (availability * performance * quality) / 10000;
    }

    // ✅ Calculate Production Rate
    if (totalTimeTaken > 0) {
      productionRate = (totalUnitsProduced / totalTimeTaken) * 60;
    }

    return { oee, productionRate };
  };

  useEffect(() => {
    if (data.length > 0) {
      const { oee, productionRate } = calculateMetrics(0);
      setOeeScore(oee);
      setProductionRate(productionRate);
    }
  }, [data]); // Runs whenever `data` changes


  const [metrics, setMetrics] = useState<OverallMetrics | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<keyof MachineMetrics>("defectRate"); // Default to defect rate
  const [machineMetrics, setMachineMetrics] = useState<MachineMetrics[]>([]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  // const fetchMetrics = async () => {
  //   try {
  //     const response = await axios.get<MachineData[]>(
  //       "https://neura-ops.onrender.com/api/v1/production/machineaverage",
  //       {
  //   headers: {
  //     Authorization: 'Bearer ' + localStorage.getItem('token'),
  //   },
  // }
  //     );
  //     const data = response.data;

  //     let totalDefectRate = 0, totalReworkRate = 0, totalFPY = 0, totalProductionRate = 0;
  //     const machineData: MachineMetrics[] = data.map((machine) => {
  //       const defectRate = (machine.scrapUnits / machine.totalUnitsProduced) * 100;
  //       const reworkRate = ((machine.goodUnitsProduced - machine.goodUnitsWithoutRework) / machine.totalUnitsProduced) * 100;
  //       const fpy = (machine.goodUnitsWithoutRework / machine.totalUnitsProduced) * 100;
  //       const productionRate = (machine.totalUnitsProduced / machine.maxProductionCapacity) * 100;

  //       totalDefectRate += defectRate;
  //       totalReworkRate += reworkRate;
  //       totalFPY += fpy;
  //       totalProductionRate += productionRate;

  //       return {
  //         machineId: machine.machineId,
  //         defectRate: defectRate.toFixed(2),
  //         reworkRate: reworkRate.toFixed(2),
  //         fpy: fpy.toFixed(2),
  //         productionRate: productionRate.toFixed(2),
  //       };
  //     });

  //     setMetrics({
  //       defectRate: (totalDefectRate / data.length).toFixed(2),
  //       reworkRate: (totalReworkRate / data.length).toFixed(2),
  //       fpy: (totalFPY / data.length).toFixed(2),
  //       productionRate: (totalProductionRate / data.length).toFixed(2),
  //     });

  //     setMachineMetrics(machineData);
  //   } catch (error) {
  //     console.error("Error fetching machine data:", error);
  //   }
  // };


  const fetchMetrics = async () => {
    try {
      const response = await axios.get("https://neura-ops.onrender.com/api/v1/production/machineaverage", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      const data = response.data;

      let totalDefectRate = 0,
        totalReworkRate = 0,
        totalFPY = 0,
        totalProductionRate = 0,
        totalOEE = 0;

      const machineData = data.map((machine: any) => {
        const {
          machineId,
          scrapUnits,
          totalUnitsProduced,
          goodUnitsProduced,
          goodUnitsWithoutRework,
          idealCycleTime,
          actualProductionTime,
          plannedProductionTime,
          totalDowntime,
        } = machine;

        // Avoid division by zero
        const safe = (numerator: number, denominator: number) => (denominator ? numerator / denominator : 0);

        const defectRate = safe(scrapUnits, totalUnitsProduced) * 100;
        const reworkRate = safe(goodUnitsProduced - goodUnitsWithoutRework, totalUnitsProduced) * 100;
        const fpy = safe(goodUnitsWithoutRework, totalUnitsProduced) * 100;
        const productionRate = safe(actualProductionTime, plannedProductionTime) * 100;

        const availability = safe(actualProductionTime, plannedProductionTime + totalDowntime) * 100;
        const performance = safe(idealCycleTime * totalUnitsProduced, actualProductionTime); // No % here
        const quality = safe(goodUnitsProduced, totalUnitsProduced) * 100;

        const oee = (availability * performance * quality) / 10000;

        totalDefectRate += defectRate;
        totalReworkRate += reworkRate;
        totalFPY += fpy;
        totalProductionRate += productionRate;
        totalOEE += oee;

        return {
          machineId,
          defectRate: defectRate.toFixed(2),
          reworkRate: reworkRate.toFixed(2),
          fpy: fpy.toFixed(2),
          productionRate: productionRate.toFixed(2),
          availability: availability.toFixed(2),
          performance: performance.toFixed(2),
          quality: quality.toFixed(2),
          oee: oee.toFixed(2),
        };
      });

      const count = data.length;

      setMetrics({
        defectRate: (totalDefectRate / count).toFixed(2),
        reworkRate: (totalReworkRate / count).toFixed(2),
        fpy: (totalFPY / count).toFixed(2),
        productionRate: (totalProductionRate / count).toFixed(2),
        oee: (totalOEE / count).toFixed(2),
      });

      setMachineMetrics(machineData);
    } catch (error) {
      console.error("Error fetching machine data:", error);
    }
  };


  const [overallEfficiencyMetrics, setOverallEfficiencyMetrics] = useState<OverallEfficiencyMetrics | null>(null);
  const [selectedEfficiencyMetric, setSelectedEfficiencyMetric] = useState<keyof MachineEfficiencyMetrics>("oeeEfficiency"); // Default to OEE Efficiency
  const [machineEfficiencyMetrics, setMachineEfficiencyMetrics] = useState<MachineEfficiencyMetrics[]>([]);

  useEffect(() => {
    fetchEfficiencyMetrics();
  }, []);


  const fetchEfficiencyMetrics = async () => {
    try {
      const response = await axios.get("https://neura-ops.onrender.com/api/v1/production/machineaverage", {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      const data = response.data;

      let totalOEEEfficiency = 0,
        totalMachineUtilizationEfficiency = 0,
        totalProductionEfficiency = 0;

      const machineEfficiencyData = data.map((machine: any) => {
        const {
          machineId,
          actualProductionTime,
          plannedProductionTime,
          goodUnitsProduced,
          totalUnitsProduced,
          idealCycleTime,
          actualMachineRunTime,
          availableMachineTime,
          totalTimeTaken,
        } = machine;

        // Avoid division by zero
        const safe = (numerator: number, denominator: number) => (denominator ? numerator / denominator : 0);

        const availability = safe(actualProductionTime, plannedProductionTime);
        const quality = safe(goodUnitsProduced, totalUnitsProduced);
        const performance = safe(totalUnitsProduced * idealCycleTime, actualMachineRunTime);

        const oeeEfficiency = availability * quality * performance * 100;

        const machineUtilizationEfficiency = safe(actualMachineRunTime, availableMachineTime) * 100;
        const productionEfficiency = safe(totalUnitsProduced * idealCycleTime, totalTimeTaken) * 100;

        totalOEEEfficiency += oeeEfficiency;
        totalMachineUtilizationEfficiency += machineUtilizationEfficiency;
        totalProductionEfficiency += productionEfficiency;

        return {
          machineId,
          oeeEfficiency: oeeEfficiency.toFixed(2),
          machineUtilizationEfficiency: machineUtilizationEfficiency.toFixed(2),
          productionEfficiency: productionEfficiency.toFixed(2),
        };
      });

      const count = data.length;

      setOverallEfficiencyMetrics({
        oeeEfficiency: (totalOEEEfficiency / count).toFixed(2),
        machineUtilizationEfficiency: (totalMachineUtilizationEfficiency / count).toFixed(2),
        productionEfficiency: (totalProductionEfficiency / count).toFixed(2),
      });

      setMachineEfficiencyMetrics(machineEfficiencyData);
    } catch (error) {
      console.error("Error fetching efficiency data:", error);
    }
  };


  const [aiInsightLoading, setAiInsightLoading] = useState(false);
  const [aiRefreshCounter, setAiRefreshCounter] = useState(0);

  const handleGetAiInsights = async () => {
  setAiInsightLoading(true);

  try {
    const token = localStorage.getItem("token");
    await axios.get(
      "https://neura-ops.onrender.com/api/v1/ai/dashboard-ai",
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    // Trigger refresh in AI Tab
    setAiRefreshCounter((prev) => prev + 1);

  } catch (error) {
    console.error("Error getting ai insights", error);
  } finally {
    setAiInsightLoading(false);
  }
};



  return (
    <div className="space-y-6 w-[1550px] overflow-x-hidden ">


      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your manufacturing operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <NavLink to="/links" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              All Links
            </NavLink>
          </Button>
          {/* <Button size="sm" className="h-9">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Insights
          </Button> */}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OEE Score</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {/* {oeeScore !== null && oeeScore !== undefined ? oeeScore.toFixed(1) : "Loading..."}% */}
                {oeeandproduction ? oeeandproduction.oee : "Loading..."} %
              </div>
            </div>
            <Progress value={oeeScore || 85} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">Target: 95%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Rate</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {/* {productionRate ? productionRate.toFixed(1) : "Loading..."} */}
                {oeeandproduction ? oeeandproduction.productionRate : "Loading..."}
              </div>
              <p className="text-s text-muted-foreground mt-1">  units/min</p>
            </div>
            <Progress value={productionRate || 93} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">Target: 2000 units/min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Status
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{inventoryandcost ? inventoryandcost.inventoryStatus.percentHealthy : "Loading..."} %</div>
              <Badge className="bg-amber-500 text-xs">
                <AlertTriangle className="mr-1 h-3 w-3" />
                {inventoryandcost ? inventoryandcost.inventoryStatus.belowReorderPoint : 0} Low
              </Badge>
            </div>
            <Progress value={92} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {inventoryandcost ? inventoryandcost.inventoryStatus.message : "Loading..."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cost Per Unit
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">${inventoryandcost ? inventoryandcost.costPerUnit.averageCost : "Loading..."}</div>
            </div>
            <Progress value={65} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {inventoryandcost ? inventoryandcost.costPerUnit.message : "Loading..."}
            </p>
          </CardContent>
        </Card>

      </div>

      <Tabs defaultValue="production" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="flex space-x-2">
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="sales">Sales & Orders</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="ai" className="bg-primary/10 text-primary">
              <Zap className="mr-1 h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <Button
            size="sm"
            className="h-9"
            onClick={handleGetAiInsights}
            disabled={aiInsightLoading}
          >
            {aiInsightLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Latest Ai Insights...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Insights
              </>
            )}
          </Button>
        </div>


        <TabsContent value="production" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Production Metrics</CardTitle>
                <CardDescription>
                  Real-time production data for the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ProductionChart />
              </CardContent>
            </Card>
            {/* <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Machine Status</CardTitle>
                <CardDescription>
                  Current status of production equipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {[
                    { name: "CNC Machine #1", status: "Running", uptime: "98.2%", alert: false },
                    { name: "Assembly Line A", status: "Running", uptime: "97.5%", alert: false },
                    { name: "Packaging Unit 3", status: "Idle", uptime: "76.4%", alert: true },
                    { name: "Quality Control", status: "Running", uptime: "99.1%", alert: false },
                    { name: "Injection Molder", status: "Maintenance", uptime: "82.3%", alert: true },
                    { name: "Laser Cutter", status: "Running", uptime: "95.7%", alert: false },
                  ].map((machine, i) => (
                    <div key={i} className="mb-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{machine.name}</div>
                        <Badge 
                          variant={machine.status === "Running" ? "outline" : "secondary"}
                          className={machine.status === "Running" ? "bg-green-500/10 text-green-500" : 
                                    machine.status === "Idle" ? "bg-amber-500/10 text-amber-500" : 
                                    "bg-blue-500/10 text-blue-500"}
                        >
                          {machine.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Uptime: {machine.uptime}</div>
                        {machine.alert && (
                          <div className="flex items-center text-amber-500">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            <span className="text-xs">Needs attention</span>
                          </div>
                        )}
                      </div>
                      <Progress 
                        value={parseFloat(machine.uptime)} 
                        className={`mt-2 h-1.5 ${
                          parseFloat(machine.uptime) > 95 ? "bg-green-500/20" : 
                          parseFloat(machine.uptime) > 85 ? "bg-amber-500/20" : 
                          "bg-red-500/20"
                        }`} 
                      />
                      {i < 5 && <Separator className="my-3" />}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card> */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Machine Status</CardTitle>
                <CardDescription>Live overview of production equipment performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {machines.map((machine: MachineStatus, i: number) => (
                    <div key={i} className="mb-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{machine.name}</div>
                        <Badge className={getStatusColorClass(machine.status)}>
                          {machine.status}
                        </Badge>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Uptime: {machine.uptime}</div>
                        {machine.alert && (
                          <div className="flex items-center text-amber-500">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            <span className="text-xs">Attention needed</span>
                          </div>
                        )}
                      </div>

                      {machine.alert && machine.issues && machine.issues.length > 0 && (
                        <ul className="mt-1 ml-2 text-xs text-amber-600 list-disc">
                          {machine.issues.map((issue: string, idx: number) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      )}

                      <Progress
                        value={parseFloat(machine.uptime) || 0}
                        className={`mt-2 h-1.5 ${getProgressColor(machine.uptime)}`}
                      />

                      {i < machines.length - 1 && <Separator className="my-3" />}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            <Card>
              <CardHeader>
                <CardTitle>Production Performance Metrics</CardTitle>
                <CardDescription>Overall production performance summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Top Metrics Summary */}
                  <div className="flex items-center justify-between">
                    {metrics && (
                      <>
                        {(["defectRate", "reworkRate", "fpy", "productionRate"] as const).map((metric) => (
                          <div
                            key={metric}
                            onClick={() => setSelectedMetric(metric)}
                            className={`cursor-pointer p-2 rounded-md transition ${selectedMetric === metric ? "bg-white/10" : ""
                              } hover:bg-white/20`}
                          >
                            <div className="text-sm font-medium">
                              {metric === "defectRate" && "Defect Rate"}
                              {metric === "reworkRate" && "Rework Rate"}
                              {metric === "fpy" && "FPY Rate"}
                              {metric === "productionRate" && "Production Rate"}
                            </div>
                            <div className="text-2xl font-bold">{metrics[metric]}%</div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  <Separator />

                  {/* Machine-Specific Metrics */}
                  <div>
                    <div className="mb-2 text-sm font-medium">
                      {selectedMetric === "defectRate" && "Machine-Specific Defect Rate"}
                      {selectedMetric === "reworkRate" && "Machine-Specific Rework Rate"}
                      {selectedMetric === "fpy" && "Machine-Specific FPY Rate"}
                      {selectedMetric === "productionRate" && "Machine-Specific Production Rate"}
                    </div>
                    <div className="space-y-2">
                      {machineMetrics.map((machine) => (
                        <div key={machine.machineId} className="grid grid-cols-2 gap-2">
                          <div className="text-sm">{machine.machineId}</div>
                          <div className="flex items-center gap-2">
                            <Progress value={parseFloat(machine[selectedMetric])} className="h-2" />
                            <span className="text-xs">{machine[selectedMetric]}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle>Production Efficiency Metrics</CardTitle>
                <CardDescription>Overall production efficiency summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Top Efficiency Summary */}
                  <div className="flex items-center justify-between">
                    {overallEfficiencyMetrics && (
                      <>
                        {(["oeeEfficiency", "machineUtilizationEfficiency", "productionEfficiency"] as const).map((efficiencyMetric) => (
                          <div
                            key={efficiencyMetric}
                            onClick={() => setSelectedEfficiencyMetric(efficiencyMetric)}
                            className={`cursor-pointer p-2 rounded-md transition ${selectedEfficiencyMetric === efficiencyMetric ? "bg-white/10" : ""
                              } hover:bg-white/20`}
                          >
                            <div className="text-sm font-medium">
                              {efficiencyMetric === "oeeEfficiency" && "OEE Efficiency"}
                              {efficiencyMetric === "machineUtilizationEfficiency" && "Machine Efficiency"}
                              {efficiencyMetric === "productionEfficiency" && "Production Efficiency"}
                            </div>
                            <div className="text-2xl font-bold">{overallEfficiencyMetrics[efficiencyMetric]}%</div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  <Separator />

                  {/* Machine-Specific Efficiency Metrics */}
                  <div>
                    <div className="mb-2 text-sm font-medium">
                      {selectedEfficiencyMetric === "oeeEfficiency" && "Machine-Specific OEE Efficiency"}
                      {selectedEfficiencyMetric === "machineUtilizationEfficiency" && "Machine-Specific Utilization Efficiency"}
                      {selectedEfficiencyMetric === "productionEfficiency" && "Machine-Specific Production Efficiency"}
                    </div>
                    <div className="space-y-2">
                      {machineEfficiencyMetrics.map((machine) => (
                        <div key={machine.machineId} className="grid grid-cols-2 gap-2">
                          <div className="text-sm">{machine.machineId}</div>
                          <div className="flex items-center gap-2">
                            <Progress value={parseFloat(machine[selectedEfficiencyMetric])} className="h-2" />
                            <span className="text-xs">{machine[selectedEfficiencyMetric]}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Production Loss Insights</CardTitle>
                <CardDescription>Key inefficiencies affecting performance</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <h4 className="font-semibold mb-2">🔧 Top Downtime Machines</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {lossInsights && (lossInsights.topDowntime.map((item: { machineId: string; totalDowntime: number }, i: number) => (
                      <li key={i}>{item.machineId} – {item.totalDowntime} mins</li>
                    )))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🧴 Top Scrap-Producing Products</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {lossInsights && (lossInsights.topScrap.map((item: { productName: string; scrapUnits: number }, i: number) => (
                      <li key={i}>{item.productName} – {item.scrapUnits} units</li>
                    )))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">📉 Machines with Lowest OEE</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {lossInsights && (lossInsights.lowOEE.map((item: { machineId: string; oee: number }, i: number) => (
                      <li key={i}>{item.machineId} – {item.oee.toFixed(2)}%</li>
                    )))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🧮 Material Usage Deviations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {lossInsights && (lossInsights.materialDeviation.map((item: { productName: string; diffPercent: number }, i: number) => (
                      <li key={i}>
                        {item.productName} – {item.diffPercent}% deviation
                      </li>
                    )))}
                  </ul>
                </div>

              </CardContent>
            </Card>


          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Inventory Levels</CardTitle>
                <CardDescription>
                  Current stock levels and material usage
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <InventoryChart />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MaterialUsage />
            <ReorderAlerts />

            {/* <Card>
              <CardHeader>
                <CardTitle>EOQ Analysis</CardTitle>
                <CardDescription>
                  Economic order quantity optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      material: "Aluminum Sheet 3mm", 
                      current: 100, 
                      recommended: 150, 
                      savings: "$420" 
                    },
                    { 
                      material: "Plastic Resin Type B", 
                      current: 200, 
                      recommended: 175, 
                      savings: "$280" 
                    },
                    { 
                      material: "Circuit Board v2", 
                      current: 50, 
                      recommended: 75, 
                      savings: "$650" 
                    },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="font-medium">{item.material}</div>
                      <div className="mt-1 grid grid-cols-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Current</div>
                          <div>{item.current}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Optimal</div>
                          <div className="font-medium text-primary">{item.recommended}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Savings</div>
                          <div className="text-emerald-500">{item.savings}</div>
                        </div>
                      </div>
                      {i < 2 && <Separator className="my-3" />}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    <Cog className="mr-2 h-4 w-4" />
                    Apply Optimizations
                  </Button>
                </div>
              </CardContent>
            </Card> */}

            <EOQAnalysisCard />

          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Financial Performance</CardTitle>
                <CardDescription>
                  Cost and revenue metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <FinancialChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>
                  Manufacturing cost analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CostBreakdown />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <BreakEvenAnalysisCard />

            <Card>
              <CardHeader>
                <CardTitle>Cash Flow</CardTitle>
                <CardDescription>
                  30-day cash flow projection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Inflow (30d)</div>
                      <div className="text-2xl font-bold">$128.5k</div>
                      <div className="flex items-center text-xs text-emerald-500">
                        <ArrowUp className="mr-1 h-3 w-3" />
                        8.2% vs. last month
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Outflow (30d)</div>
                      <div className="text-2xl font-bold">$104.2k</div>
                      <div className="flex items-center text-xs text-red-500">
                        <ArrowUp className="mr-1 h-3 w-3" />
                        5.7% vs. last month
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="mb-2 text-sm font-medium">Upcoming Payments</div>
                    <div className="space-y-2">
                      {[
                        { name: "Supplier Payment", amount: "$42,800", due: "In 5 days" },
                        { name: "Equipment Lease", amount: "$8,500", due: "In 12 days" },
                        { name: "Utility Bills", amount: "$3,200", due: "In 18 days" },
                      ].map((payment, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="text-sm">{payment.name}</div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium">{payment.amount}</div>
                            <div className="text-xs text-muted-foreground">{payment.due}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle>Cost Reduction</CardTitle>
                <CardDescription>
                  AI-suggested optimization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      area: "Material Substitution",
                      saving: "$0.42/unit",
                      impact: "High",
                      description: "Replace aluminum components with composite alternatives"
                    },
                    {
                      area: "Process Optimization",
                      saving: "$0.28/unit",
                      impact: "Medium",
                      description: "Reduce cycle time in assembly stage by 12%"
                    },
                    {
                      area: "Supplier Negotiation",
                      saving: "$0.15/unit",
                      impact: "Medium",
                      description: "Consolidate orders with Supplier B for volume discount"
                    },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{item.area}</div>
                        <Badge
                          variant="outline"
                          className={
                            item.impact === "High"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-amber-500/10 text-amber-500"
                          }
                        >
                          {item.impact}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </div>
                      <div className="mt-1 text-sm font-medium text-emerald-500">
                        Potential savings: {item.saving}
                      </div>
                      {i < 2 && <Separator className="my-3" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            <FinancialSummaryCard />
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <SalesAndOrder />
        </TabsContent>


        <TabsContent value="ai" className="space-y-4">

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Actionable recommendations based on your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AiResponseCard refreshKey={aiRefreshCounter} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Actionable recommendations based on your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIInsightsCard refreshKey={aiRefreshCounter} />
              </CardContent>
            </Card>
            <PredictiveInsights refreshKey={aiRefreshCounter} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* <Card>
              <CardHeader>
                <CardTitle>SOP Compliance</CardTitle>
                <CardDescription>
                  AI monitoring of standard operating procedures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Overall Compliance</div>
                      <div className="text-2xl font-bold">92.7%</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <ArrowUp className="mr-1 h-3 w-3 text-emerald-500" />
                      3.2%
                    </Badge>
                  </div>
                  <Progress value={92.7} className="h-2" />
                  <Separator />
                  <div>
                    <div className="mb-2 text-sm font-medium">Compliance by Area</div>
                    <div className="space-y-3">
                      {[
                        { area: "Quality Control", compliance: 96.8, status: "Compliant" },
                        { area: "Safety Protocols", compliance: 98.2, status: "Compliant" },
                        { area: "Production Process", compliance: 88.5, status: "Needs Review" },
                        { area: "Material Handling", compliance: 91.3, status: "Compliant" },
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{item.area}</div>
                            <Badge
                              variant="outline"
                              className={
                                item.compliance > 95
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : item.compliance > 90
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "bg-red-500/10 text-red-500"
                              }
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Progress value={item.compliance} className="h-2 flex-1" />
                            <span className="text-xs">{item.compliance}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card> */}

            <RiskAssessment refreshKey={aiRefreshCounter} />

            <LatestQuestionsCard refreshKey={aiRefreshCounter} />

            <Card>
              <Chat />
            </Card>
          </div>
        </TabsContent>


      </Tabs>

      {showChat && (
        <ChatAssistant onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}