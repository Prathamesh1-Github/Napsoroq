import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft,
    Save,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useState } from "react";

const variableCostSchema = z.object({
    month: z.string().min(1, "Month is required"), // Format: "2025-05"
    rawMaterials: z.number().optional(),
    packagingMaterial: z.number().optional(),
    directLabor: z.number().optional(),
    electricityUsage: z.number().optional(),
    fuelGasDiesel: z.number().optional(),
    consumables: z.number().optional(),
    dispatchLogistics: z.number().optional(),
    salesCommission: z.number().optional(),
    transactionCharges: z.number().optional(),
    reworkScrapLoss: z.number().optional(),
    qcInspection: z.number().optional(),
    warrantyService: z.number().optional()
});

type VariableCostFormValues = z.infer<typeof variableCostSchema>;

export function VariableCostInputForm() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<VariableCostFormValues>({
        resolver: zodResolver(variableCostSchema),
        defaultValues: {}
    });

    const onSubmit = async (data: VariableCostFormValues) => {
        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([key]) => key === "month" || selectedFields.includes(key))
        );

        try {
            setLoading(true);
            await axios.post('https://neura-ops.onrender.com/api/v1/financecost/variable', filteredData,
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            toast({ title: "Success", description: "Variable cost entry saved." });
            navigate('/');
        } catch (error) {
            toast({ title: "Error", description: "Failed to save variable cost entry.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { label: "Raw Materials", key: "rawMaterials" },
        { label: "Packaging Material", key: "packagingMaterial" },
        { label: "Direct Labor", key: "directLabor" },
        { label: "Electricity Usage", key: "electricityUsage" },
        { label: "Fuel (Gas/Diesel)", key: "fuelGasDiesel" },
        { label: "Consumables", key: "consumables" },
        { label: "Dispatch & Logistics", key: "dispatchLogistics" },
        { label: "Sales Commission", key: "salesCommission" },
        { label: "Transaction Charges", key: "transactionCharges" },
        { label: "Rework / Scrap Loss", key: "reworkScrapLoss" },
        { label: "QC / Inspection", key: "qcInspection" },
        { label: "Warranty / Service", key: "warrantyService" }
    ];

    const toggleFieldSelection = (key: string) => {
        setSelectedFields(prev =>
            prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
        );
    };

    return (
        <div className="w-screen container mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between bg-background p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <Save className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Variable Costs Entry</h1>
                        <p className="text-muted-foreground">Select and add monthly variable costs</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => navigate('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>

            {/* Step 0: Select Month */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Month</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Input type="month" id="month" {...register("month")} className={errors.month ? "border-destructive" : ""} />
                    {errors.month && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.month.message}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Step 1: Field selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Fields</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map(({ label, key }) => (
                        <div key={key} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={key}
                                checked={selectedFields.includes(key)}
                                onChange={() => toggleFieldSelection(key)}
                            />
                            <Label htmlFor={key}>{label}</Label>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Step 2: Input values */}
            {selectedFields.length > 0 && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Enter Values</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {fields
                                .filter(field => selectedFields.includes(field.key))
                                .map(({ label, key }) => (
                                    <div key={key} className="space-y-2">
                                        <Label htmlFor={key}>{label}</Label>
                                        <Input
                                            type="number"
                                            {...register(key as keyof VariableCostFormValues, { valueAsNumber: true })}
                                            className={errors[key as keyof VariableCostFormValues] ? "border-destructive" : ""}
                                        />
                                        {errors[key as keyof VariableCostFormValues] && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors[key as keyof VariableCostFormValues]?.message}
                                            </p>
                                        )}
                                    </div>
                                ))}
                        </CardContent>
                        <div className="flex justify-between p-6 pt-0">
                            <Button type="button" variant="outline" onClick={() => navigate('/')}>
                                Cancel
                            </Button>
                            <Button type="submit" className="gap-2" disabled={loading}>
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                <Save className="h-4 w-4" />
                                Save Variable Cost
                            </Button>
                        </div>
                    </Card>
                </form>
            )}
        </div>
    );
}
