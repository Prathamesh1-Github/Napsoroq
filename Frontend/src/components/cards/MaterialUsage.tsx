import { useEffect, useState } from "react";
import axios from 'axios';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MaterialUsage {
    materialName: string;
    avgActualUsed: number;
    avgEstimatedUsed: number;
}

const MaterialUsage = () => {
    const [materials, setMaterials] = useState<{
        id: string;
        name: string;
        actual: number;
        estimated: number;
        trend: "up" | "down";
        percent: number;
    }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        axios
            .get("https://neura-ops.onrender.com/api/v1/productproduction/productproductionusage", {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  })
            .then((response) => {
                const usageData: Record<string, MaterialUsage> = response.data.averageMaterialUsage;

                const formatted = Object.entries(usageData).map(([id, data]) => ({
                    id,
                    name: data.materialName,
                    actual: data.avgActualUsed,
                    estimated: data.avgEstimatedUsed,
                    trend: (Math.random() > 0.5 ? "up" : "down") as "up" | "down",
                    percent: parseFloat((Math.random() * 5).toFixed(1))
                }));

                setMaterials(formatted);
            })
            .catch(() =>
                console.error("Error fetching material usage data")
            )
            .finally(() => setLoading(false));
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Material Usage</CardTitle>
                <CardDescription>
                    Estimated vs actual usage comparison
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="space-y-4">
                        {materials.map((material, i) => (
                            <div key={material.id}>
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">{material.name}</div>
                                    <div className="flex items-center">
                                        {material.trend === "up" ? (
                                            <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                                        )}
                                        <span className={`text-xs ${material.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                                            {material.percent}%
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    Actual: {material.actual} units/day | Estimated: {material.estimated} units/day
                                </div>
                                <Progress
                                    value={
                                        material.estimated > 0
                                            ? Math.min((material.actual / material.estimated) * 100, 100)
                                            : 0
                                    }
                                    max={100}
                                    className="mt-2 h-2"
                                />
                                {i < materials.length - 1 && <Separator className="my-3" />}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default MaterialUsage;
