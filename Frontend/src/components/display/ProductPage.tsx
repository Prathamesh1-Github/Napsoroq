import { useEffect, useState } from "react";
// import { getProducts } from "../api/ProductAPI";
import { ProductDashboard } from "../essentialsforPage/Product"; // your dashboard component for products



interface Product {
    _id: string;
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
    rawMaterials: Array<{
        rawMaterialId: string;
        quantity: number;
    }>;
    semiFinishedComponents: Array<{
        productId: string;
        quantity: number;
    }>;
    machines: Array<{
        machineId: string;
        cycleTime: number;
    }>;
    manualJobs: Array<{
        jobId: string;
        expectedTimePerUnit: number;
    }>;
}


export function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("https://neura-ops.onrender.com/api/v1/product", {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
                if (!response.ok) {
                    throw new Error("Failed to fetch customers");
                }
                const data = await response.json();
                setProducts(data.products);
            } catch (err) {
                setError("Failed to fetch products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return <ProductDashboard products={products} />;
}