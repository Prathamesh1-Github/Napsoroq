export interface FinanceMetrics {
    breakEvenVolume: number;
    breakEvenRevenue: number;
    grossProfit: number;
    netProfit: number;
    grossProfitMargin: number;
    netProfitMargin: number;
    inventoryTurnover: number;
    costPerUnit: number;
    utilityPerUnit: number;
    machineCostPerUnit: number;
    materialConsumptionPerOrder: number;
    minimumSellingPrice: number;
  }
  
  export function calculateFinanceMetrics(data: any): FinanceMetrics {
    // Break-even analysis
    const breakEvenVolume = data.totalFixedCost / 
      (data.sellingPricePerUnit - data.variableCostPerUnit);
    
    const breakEvenRevenue = breakEvenVolume * data.sellingPricePerUnit;
    
    // Profitability metrics
    const grossProfit = data.totalRevenue - data.costOfGoodsSold;
    const netProfit = grossProfit - data.totalFixedCost - data.marketingAdvertisingExpense;
    
    const grossProfitMargin = (grossProfit / data.totalRevenue) * 100;
    const netProfitMargin = (netProfit / data.totalRevenue) * 100;
    
    // Inventory metrics
    const inventoryTurnover = data.costOfGoodsSold / data.averageInventoryValue;
    
    // Cost metrics
    const costPerUnit = (data.totalRawMaterialCost + 
      data.machineMaintenanceCost + 
      data.machineDepreciationCost + 
      data.totalUtilityCost) / data.totalProductionVolume;
  
    // Additional metrics
    const utilityPerUnit = data.totalUtilityCost / data.totalProductionVolume;
    const machineCostPerUnit = (data.machineMaintenanceCost + data.machineDepreciationCost) / data.totalProductionVolume;
    const materialConsumptionPerOrder = data.totalRawMaterialCost / data.averageMonthlySalesVolume;
    const minimumSellingPrice = costPerUnit * 1.2; // 20% margin
  
    return {
      breakEvenVolume,
      breakEvenRevenue,
      grossProfit,
      netProfit,
      grossProfitMargin,
      netProfitMargin,
      inventoryTurnover,
      costPerUnit,
      utilityPerUnit,
      machineCostPerUnit,
      materialConsumptionPerOrder,
      minimumSellingPrice
    };
  }

