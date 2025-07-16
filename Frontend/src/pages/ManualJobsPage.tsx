import { useEffect, useState } from "react";
import { ManualJobDashboard } from "@/components/essentialsforPage/ManualJob";
import axios from 'axios';
import { Loader2 } from "lucide-react";

interface ManualJob {
    _id: string;
    jobName: string;
    department: string;
    jobType: string;
    manualJobCategory: string;
    jobDescription: string;
    estimatedDuration: number;
    inputType: string;
    inputPerUnit: number;
    inputUnitOfMeasure: string;
    rawMaterials: Array<{
        rawMaterialId: string;
        rawMaterialName: string;
    }>;
    minimumWorkersRequired: number;
    costType: string;
    costPerUnit?: number;
    hourlyCostRate?: number;
    fixedCostPerDay?: number;
}

export default function ManualJobsPage() {
    const [manualJobs, setManualJobs] = useState<ManualJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchManualJobs = async () => {
            try {
                const response = await axios.get("https://neura-ops.onrender.com/api/v1/manualjob",
                    {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                );
                setManualJobs(response.data.jobs);
                setLoading(false);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.message);
                } else {
                    setError('An unexpected error occurred');
                }
                setLoading(false);
            }
        };

        fetchManualJobs();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    return <ManualJobDashboard manualJobs={manualJobs} />;
} 