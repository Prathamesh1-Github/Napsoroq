import { useEffect, useState } from "react";
import { RawMaterialDashboard } from "../essentialsforPage/RawMaterial";

interface RawMaterial {
    _id: string;
    rawMaterialName: string;
    rawMaterialCode: string;
    category: string;
    preferredSuppliers: string[];
    purchaseUOM: string;
    leadTime: number;
    currentStockLevel: number;
    safetyStockLevel: number;
    reorderPoint: number;
    pricePerUnit: number;
    stockLocation: string;
    storageConditions: string;
    qualityStandards: string[];
    createdAt: string;
}

export function RawMaterialPage() {
    const [materials, setMaterials] = useState<RawMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const response = await fetch("https://neura-ops.onrender.com/api/v1/rawmaterial", {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
                if (!response.ok) {
                    throw new Error("Failed to fetch raw materials");
                }
                const data = await response.json();
                setMaterials(data.rawMaterials);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return <RawMaterialDashboard materials={materials} />;
}