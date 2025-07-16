import { useEffect, useState } from "react";
import { SupplierDashboard } from "../essentialsforPage/Supplier";

export function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await fetch("https://neura-ops.onrender.com/api/v1/suppliers", {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
                if (!response.ok) {
                    throw new Error("Failed to fetch suppliers");
                }
                const data = await response.json();
                setSuppliers(data.suppliers);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchSuppliers();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return <SupplierDashboard suppliers={suppliers} />;
}