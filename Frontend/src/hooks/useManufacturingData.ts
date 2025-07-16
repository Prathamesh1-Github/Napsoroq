import { useState, useEffect } from 'react';

export interface ManufacturingData {
  // OEE Parameters
  availability: number;
  performance: number;
  quality: number;
  totalAvailableTime: number;
  downtime: number;
  actualCycleTime: number;
  standardCycleTime: number;
  goodUnits: number;
  totalUnitsProduced: number;
  oeeTarget: number;
  
  // Production Rate Parameters
  totalTime: number;
  productionRateTarget: number;
  
  // Cost Per Unit Parameters
  totalProductionCost: number;
  costPerUnitTarget: number;
  
  // Inventory Status Parameters
  totalInventoryCapacity: number;
  currentInventoryLevel: number;
  reorderPoint: number;
  safetyStock: number;
  
  // Material Stock Levels
  materials: {
    name: string;
    currentStock: number;
    capacity: number;
    reorderPoint: number;
  }[];
}

export const useManufacturingData = () => {
  const [manufacturingData, setManufacturingData] = useState<ManufacturingData>({
    // OEE Parameters
    availability: 92.5,
    performance: 88.3,
    quality: 97.2,
    totalAvailableTime: 24,
    downtime: 1.8,
    actualCycleTime: 45,
    standardCycleTime: 40,
    goodUnits: 1750,
    totalUnitsProduced: 1800,
    oeeTarget: 85,
    
    // Production Rate Parameters
    totalTime: 24,
    productionRateTarget: 80,
    
    // Cost Per Unit Parameters
    totalProductionCost: 22446,
    costPerUnitTarget: 12,
    
    // Inventory Status Parameters
    totalInventoryCapacity: 10000,
    currentInventoryLevel: 9200,
    reorderPoint: 3000,
    safetyStock: 40,
    
    // Material Stock Levels
    materials: [
      { name: 'Aluminum', currentStock: 85, capacity: 100, reorderPoint: 20 },
      { name: 'Steel', currentStock: 62, capacity: 100, reorderPoint: 15 },
      { name: 'Plastic', currentStock: 18, capacity: 100, reorderPoint: 20 },
      { name: 'Circuit Boards', currentStock: 32, capacity: 100, reorderPoint: 30 },
      { name: 'Copper Wire', currentStock: 45, capacity: 100, reorderPoint: 25 },
      { name: 'Glass', currentStock: 38, capacity: 100, reorderPoint: 20 },
      { name: 'Rubber', currentStock: 55, capacity: 100, reorderPoint: 30 },
      { name: 'Packaging', currentStock: 22, capacity: 100, reorderPoint: 25 },
    ]
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('manufacturingData');
    if (savedData) {
      setManufacturingData(JSON.parse(savedData));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('manufacturingData', JSON.stringify(manufacturingData));
  }, [manufacturingData]);

  // Calculate OEE Score
  const calculateOEE = () => {
    // OEE = Availability × Performance × Quality
    return (manufacturingData.availability * manufacturingData.performance * manufacturingData.quality) / 10000;
  };

  // Calculate Production Rate
  const calculateProductionRate = () => {
    // Production Rate = Total Units Produced / Total Time
    return manufacturingData.totalUnitsProduced / manufacturingData.totalTime;
  };

  // Calculate Cost Per Unit
  const calculateCostPerUnit = () => {
    // Cost Per Unit = Total Production Cost / Total Units Produced
    return manufacturingData.totalProductionCost / manufacturingData.totalUnitsProduced;
  };

  // Calculate Inventory Status
  const calculateInventoryStatus = () => {
    // Inventory Status = (Current Inventory Level / Total Inventory Capacity) × 100
    return (manufacturingData.currentInventoryLevel / manufacturingData.totalInventoryCapacity) * 100;
  };

  // Update manufacturing data
  const updateManufacturingData = (newData: Partial<ManufacturingData>) => {
    setManufacturingData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  return {
    manufacturingData,
    updateManufacturingData,
    calculateOEE,
    calculateProductionRate,
    calculateCostPerUnit,
    calculateInventoryStatus
  };
};