import { useEffect, useState } from "react";
import axios from 'axios';
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface CostData {
    fixedCost: {
        administrationTotal: number;
        factoryOverheadTotal: number;
        financialTotal: number;
    };
    variableCost: {
        materialAndLaborTotal: number;
        utilitiesAndConsumablesTotal: number;
        salesAndLogisticsTotal: number;
        qualityAndAfterSalesTotal: number;
    };
    grandTotalCost: number;
}

const fetchMonthlyCostBreakdown = async (): Promise<CostData | null> => {

    try {
        const res = await axios.get(
            `https://neura-ops.onrender.com/api/v1/financecost/cboverall`,
            {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token'),
                },
            }
        );
        return res.data;
    } catch (err) {
        console.error("Error fetching cost breakdown:", err);
        return null;
    }
};

const CostBreakdown = () => {
    const [data, setData] = useState<CostData | null>(null);

    useEffect(() => {
        fetchMonthlyCostBreakdown().then(setData);
    }, []);

    if (!data) return <div>Loading cost breakdown...</div>;

    const {
        fixedCost,
        variableCost,
        grandTotalCost
    } = data;

    const costs = [
        { category: "Administration", cost: fixedCost.administrationTotal },
        { category: "Factory Overhead", cost: fixedCost.factoryOverheadTotal },
        { category: "Financial", cost: fixedCost.financialTotal },
        { category: "Material & Labor", cost: variableCost.materialAndLaborTotal },
        { category: "Utilities & Consumables", cost: variableCost.utilitiesAndConsumablesTotal },
        { category: "Sales & Logistics", cost: variableCost.salesAndLogisticsTotal },
        { category: "Quality & After Sales", cost: variableCost.qualityAndAfterSalesTotal },
    ];

    const costWithPercent = costs.map(c => ({
        ...c,
        percent: grandTotalCost ? ((c.cost / grandTotalCost) * 100).toFixed(1) : 0
    }));

    return (
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-4">
            <div className="space-y-4">
                {costWithPercent.map((cost, i) => (
                    <div key={i}>
                        <div className="flex items-center justify-between">
                            <div className="font-medium">{cost.category}</div>
                            <div className="text-sm font-medium">₹{cost.cost.toLocaleString()}</div>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-sm">
                            <Progress value={parseFloat(String(cost.percent))} className="h-2 flex-1" />
                            <span className="ml-2 text-xs text-muted-foreground">{cost.percent}%</span>
                        </div>
                        {i < costWithPercent.length - 1 && <Separator className="my-2" />}
                    </div>
                ))}
            </div>

            <div className="border-t pt-4 mt-4 flex justify-between text-lg font-bold">
                <span>Grand Total Cost</span>
                <span>₹{grandTotalCost.toLocaleString()}</span>
            </div>
        </div>
    );
};

export default CostBreakdown;
