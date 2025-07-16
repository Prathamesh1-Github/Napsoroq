import { useEffect, useState } from "react";
import { BusinessCustomerDashboard } from "../essentialsforPage/BusinessCustomer";
import type { Customer } from "@/types";

export function BusinessCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch("https://neura-ops.onrender.com/api/v1/businessCustomer", {
                    headers: {
                        Authorization: 'Bearer ' + token,
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch customers");
                }
                const data = await response.json();
                setCustomers(data.customers);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return <BusinessCustomerDashboard customers={customers} />;
}