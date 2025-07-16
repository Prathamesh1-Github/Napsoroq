import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type InventoryItem = {
  name: string;
  current: number;
  min: number;
  max: number;
};

export function InventoryChart() {
  const [inventoryType, setInventoryType] = useState<'raw' | 'finished' | 'semifinished' | 'packaging'>('raw');
  const [rawMaterialsData, setRawMaterialsData] = useState<InventoryItem[]>([]);
  const [finishedGoodsData, setFinishedGoodsData] = useState<InventoryItem[]>([]);
  const [semifinishedGoodsData, setSemiFinishedGoodsData] = useState<InventoryItem[]>([]);
  const [packagingMaterialsData, setPackagingMaterialsData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const rawRes = await fetch('https://neura-ops.onrender.com/api/v1/rawmaterial', {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
        const productRes = await fetch('https://neura-ops.onrender.com/api/v1/product', {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
        const packagingRes = await fetch('https://neura-ops.onrender.com/api/v1/packaging-materials', {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
        const semifinishedproductRes = await fetch('https://neura-ops.onrender.com/api/v1/semifinished', {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });

        const rawMaterials = await rawRes.json();
        const products = await productRes.json();
        const packaging = await packagingRes.json();
        const semifinishedproducts = await semifinishedproductRes.json();

        setRawMaterialsData(
          rawMaterials.rawMaterials.map((item: any) => ({
            name: item.rawMaterialName,
            current: item.currentStockLevel,
            min: item.reorderPoint,
            max: item.safetyStockLevel || 100,
          }))
        );

        setFinishedGoodsData(
          products.products.map((item: any) => ({
            name: item.productName,
            current: item.currentStock,
            min: item.minimumStockLevel,
            max: item.reorderPoint,
          }))
        );

        setSemiFinishedGoodsData(
          semifinishedproducts.products.map((item: any) => ({
            name: item.productName,
            current: item.currentStock,
            min: item.minimumStockLevel,
            max: item.reorderPoint,
          }))
        );

        setPackagingMaterialsData(
          packaging.materials.map((item: any) => ({
            name: item.rawMaterialName,
            current: item.currentStockLevel,
            min: item.reorderPoint,
            max: item.safetyStockLevel || 100,
          }))
        );
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  if (loading) {
    return <p>Loading inventory data...</p>;
  }

  const data =
    inventoryType === 'raw'
      ? rawMaterialsData
      : inventoryType === 'finished'
      ? finishedGoodsData
      : inventoryType === 'semifinished'
      ? semifinishedGoodsData
      : packagingMaterialsData;

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <Tabs defaultValue="raw" onValueChange={(value) => setInventoryType(value as 'raw' | 'finished' | 'packaging')} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="raw">Raw Materials</TabsTrigger>
              <TabsTrigger value="finished">Finished Goods</TabsTrigger>
              <TabsTrigger value="semifinished">SemiFinished Goods</TabsTrigger>
              <TabsTrigger value="packaging">Packaging Materials</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={inventoryType} className="mt-2">
            <ResponsiveContainer width="100%" height={330}>
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)', fontSize: '12px', color: 'hsl(var(--popover-foreground))' }}
                  formatter={(value, name, props) => {
                    if (name === 'current') {
                      return [`${value} units`, 'Current Level'];
                    } else if (name === 'min') {
                      return [`${props.payload.min} units`, 'Minimum Stock Level'];
                    }
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="current" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Current Level" />
                <ReferenceLine y={0} stroke="hsl(var(--border))" />
                {data.map((entry, index) => (
                  <ReferenceLine 
                    key={`ref-min-${index}`} 
                    y={entry.min} 
                    stroke="hsl(var(--destructive))" 
                    strokeDasharray="3 3" 
                    isFront={true} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
