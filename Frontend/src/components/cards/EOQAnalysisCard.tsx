import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Cog, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
  productId: string;
  productName: string;
  batchSize: number;
  currentStock: number;
  minimumStockLevel: number;
  reorderPoint: number;
  leadTime: number;
  totalProductionCost: number;
}

interface RawMaterial {
  rawMaterialName: string;
  currentStockLevel: number;
  reorderPoint: number;
  minimumOrderQuantity: number;
  pricePerUnit: number;
  leadTime: number;
  safetyStockLevel: number;
}

interface EOQItem {
  name: string;
  current: number;
  recommended: number;
  savings: number;
  type: 'product' | 'rawMaterial';
  stockLevel: number;
  reorderPoint: number;
}

export function EOQAnalysisCard() {
  const [items, setItems] = useState<EOQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  // Calculate EOQ for products
  const calculateProductEOQ = (product: Product): number => {
    const annualDemand = product.batchSize * 12; // Estimated annual demand
    const orderingCost = product.totalProductionCost * 0.1; // Estimated ordering cost (10% of production cost)
    const holdingCost = product.totalProductionCost * 0.15; // Estimated holding cost (15% of production cost)
    
    return Math.round(Math.sqrt((2 * annualDemand * orderingCost) / holdingCost));
  };

  // Calculate EOQ for raw materials
  const calculateRawMaterialEOQ = (material: RawMaterial): number => {
    const annualDemand = material.minimumOrderQuantity * 12; // Estimated annual demand
    const orderingCost = material.pricePerUnit * material.minimumOrderQuantity * 0.1; // Estimated ordering cost
    const holdingCost = material.pricePerUnit * 0.15; // Holding cost (15% of unit price)

    return Math.round(Math.sqrt((2 * annualDemand * orderingCost) / holdingCost));
  };

  // Calculate potential savings
  const calculateSavings = (current: number, recommended: number, costPerUnit: number): number => {
    const currentCost = current * costPerUnit * 0.15; // Current holding cost
    const recommendedCost = recommended * costPerUnit * 0.15; // Recommended holding cost
    return Math.round(currentCost - recommendedCost);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products and raw materials
        const [productsResponse, materialsResponse] = await Promise.all([
          fetch('https://neura-ops.onrender.com/api/v1/product', {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  }),
          fetch('https://neura-ops.onrender.com/api/v1/rawmaterial', {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  })
        ]);

        const productsData = await productsResponse.json();
        const materialsData = await materialsResponse.json();

        // Process products
        const productEOQItems = productsData.products.map((product: Product) => {
          const eoq = calculateProductEOQ(product);
          return {
            name: product.productName,
            current: product.batchSize,
            recommended: eoq,
            savings: calculateSavings(product.batchSize, eoq, product.totalProductionCost),
            type: 'product' as const,
            stockLevel: product.currentStock,
            reorderPoint: product.reorderPoint
          };
        });

        // Process raw materials
        const materialEOQItems = materialsData.rawMaterials.map((material: RawMaterial) => {
          const eoq = calculateRawMaterialEOQ(material);
          return {
            name: material.rawMaterialName,
            current: material.minimumOrderQuantity,
            recommended: eoq,
            savings: calculateSavings(material.minimumOrderQuantity, eoq, material.pricePerUnit),
            type: 'rawMaterial' as const,
            stockLevel: material.currentStockLevel,
            reorderPoint: material.reorderPoint
          };
        });

        // Combine and sort by potential savings
        const allItems = [...productEOQItems, ...materialEOQItems]
          .sort((a, b) => b.savings - a.savings)
          .slice(0, 3); // Show top 3 opportunities

          console.log(materialEOQItems)
          console.log(allItems)
        setItems(allItems);
        setError(null);
      } catch (err) {
        setError('Failed to fetch EOQ data');
        console.error('Error fetching EOQ data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>EOQ Analysis</CardTitle>
          <CardDescription>Loading optimization data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <Cog className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>EOQ Analysis</CardTitle>
          <CardDescription>Economic order quantity optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6 text-destructive">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>EOQ Analysis</CardTitle>
        <CardDescription>Economic order quantity optimization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between">
                <div className="font-medium">{item.name}</div>
                <Badge variant={item.type === 'product' ? 'default' : 'secondary'}>
                  {item.type === 'product' ? 'Product' : 'Raw Material'}
                </Badge>
              </div>
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
                  <div className="text-emerald-500">${item.savings}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Stock Level: {item.stockLevel} | Reorder Point: {item.reorderPoint}
              </div>
              {i < items.length - 1 && <Separator className="my-3" />}
            </div>
          ))}
          <Button variant="outline" size="sm" className="mt-2 w-full">
            <Cog className="mr-2 h-4 w-4" />
            Apply Optimizations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}