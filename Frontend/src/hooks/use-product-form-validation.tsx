import { useState } from 'react';
import { z } from 'zod';

export interface ProductForm {
    productId: string;
    productName: string;
    productCategory: string;
    productSKU: string;
    uom: string;
    productVariant: string;
    sellingPrice: number;
    batchSize: number;
    productWeight: number;
    totalMaterialCost: number;
    laborCost: number;
    machineCost: number;
    overheadCost: number;
    totalProductionCost: number;
    profitMargin: number;
    finalSellingPrice: number;
    currentStock: number;
    minimumStockLevel: number;
    reorderPoint: number;
    leadTime: number;
    qualityCheckRequired: boolean;
    inspectionCriteria: string;
    defectTolerance: number;
    rawMaterials: { rawMaterialId: string; quantity: number }[];
    machines: {
      machineId: string;
      cycleTime: number;
      productsProducedInOneCycleTime: number;
    }[];
    cycleTime: number;
    manualJobs: { jobId: string; expectedTimePerUnit: number }[];
    semiFinishedComponents: { productId: string; quantity: number }[];
  }

export function useProductFormValidation(formData: ProductForm) {
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  const productDetailsSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    productName: z.string().min(1, 'Product name is required'),
    productCategory: z.string().min(1, 'Product category is required'),
    productSKU: z.string().min(1, 'Product SKU is required'),
    uom: z.string().min(1, 'Unit of measurement is required'),
    batchSize: z.number().min(1, 'Batch size must be at least 1'),
  });

  const costingDetailsSchema = z.object({
    totalMaterialCost: z.number().min(0, 'Material cost cannot be negative'),
    laborCost: z.number().min(0, 'Labor cost cannot be negative'),
    machineCost: z.number().min(0, 'Machine cost cannot be negative'),
    overheadCost: z.number().min(0, 'Overhead cost cannot be negative'),
    profitMargin: z.number().min(0, 'Profit margin cannot be negative'),
  });

  const inventoryDetailsSchema = z.object({
    minimumStockLevel: z.number().min(0, 'Minimum stock level cannot be negative'),
    reorderPoint: z.number().min(0, 'Reorder point cannot be negative'),
    leadTime: z.number().min(0, 'Lead time cannot be negative'),
  });

  const qualityControlSchema = z.object({
    qualityCheckRequired: z.boolean(),
    inspectionCriteria: z.string().optional(),
    defectTolerance: z.number().min(0, 'Defect tolerance cannot be negative').max(100, 'Defect tolerance cannot exceed 100%'),
  });

  const validateTab = (tabName: string): boolean => {
    try {
      switch(tabName) {
        case 'productDetails':
          productDetailsSchema.parse(formData);
          break;
        case 'costingDetails':
          costingDetailsSchema.parse(formData);
          break;
        case 'inventoryDetails':
          inventoryDetailsSchema.parse(formData);
          break;
        case 'qualityControl':
          qualityControlSchema.parse(formData);
          break;
        case 'rawMaterials':
          // Optional validation for raw materials
          break;
        case 'production':
          // Optional validation for production
          break;
        case 'manualJobs':
          // Optional validation for manual jobs
          break;
        case 'semiFinished':
          // Optional validation for semi-finished components
          break;
        default:
          return true;
      }
      
      // Clear errors for this tab if validation passes
      setErrors(prev => ({
        ...prev,
        [tabName]: {}
      }));
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        
        error.errors.forEach(err => {
          const field = err.path[0].toString();
          newErrors[field] = err.message;
        });
        
        setErrors(prev => ({
          ...prev,
          [tabName]: newErrors
        }));
      }
      
      return false;
    }
  };

  return { validateTab, errors };
}