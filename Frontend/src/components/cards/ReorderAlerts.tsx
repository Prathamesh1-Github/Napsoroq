import { useEffect, useState } from "react";
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface Material {
    name: string;
    level: number;
    threshold: number;
    urgent: boolean;
}

export function ReorderAlerts() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLowStockMaterials = async () => {
        try {
            const response = await axios.get(
                "https://neura-ops.onrender.com/api/v1/rawmaterial/low-stock",
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            setMaterials(
            response.data.lowStockMaterials.map((item: any) => ({
                name: item.rawMaterialName,
                level: item.currentStockLevel,
                threshold: item.safetyStockLevel,
                urgent: item.currentStockLevel < item.safetyStockLevel * 0.75,
            }))
            );
        } catch (error) {
            console.error("Error fetching low-stock materials:", error);
        } finally {
            setLoading(false);
        }
        };
        fetchLowStockMaterials();
    }, []);

    if (loading) return <p>Loading reorder alerts...</p>;

    return (
        <Card>
        <CardHeader>
            <CardTitle>Reorder Alerts</CardTitle>
            <CardDescription>Materials below threshold levels</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[300px] pr-4">
            {materials.map((material, i) => (
                <div key={i} className="mb-4">
                <div className="flex items-center justify-between">
                    <div className="font-medium">{material.name}</div>
                    <Badge 
                        variant={material.urgent ? "destructive" : "outline"}
                        className={material.urgent ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}
                    >
                        {material.urgent ? "Critical" : "Low"}
                    </Badge>
                </div>

                <div className="mt-1 flex items-center justify-between text-sm">
                    <div className="text-muted-foreground">
                    {material.level} units (min: {material.threshold})
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    Order
                    </Button>
                </div>
                <Progress 
                    value={(material.level / material.threshold) * 100} 
                    className={`mt-2 h-1.5 ${
                    material.level < material.threshold * 0.5 ? "bg-red-500/20" : 
                    "bg-amber-500/20"
                    }`} 
                />
                {i < materials.length - 1 && <Separator className="my-3" />}
                </div>
            ))}
            </ScrollArea>
        </CardContent>
        </Card>
    );
}

