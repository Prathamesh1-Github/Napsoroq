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
    Package,
    AlertCircle
} from 'lucide-react';
import { useState } from "react";

const fixedCostSchema = z.object({
    rentLeaseOfficeShopFactoryWarehouse: z.number().optional(),
    adminSalaries: z.number().optional(),
    ownerSalaryDraw: z.number().optional(),
    statutoryContributions: z.number().optional(),
    fixedElectricityCharges: z.number().optional(),
    waterBaseCharges: z.number().optional(),
    internetPhones: z.number().optional(),
    softwareSubscriptions: z.number().optional(),
    loanEMIs: z.number().optional(),
    accountingAuditFees: z.number().optional(),
    legalComplianceFees: z.number().optional(),
    websiteHostingDomain: z.number().optional(),
    insurancePremiums: z.number().optional(),
    businessLicenses: z.number().optional(),
    amcContracts: z.number().optional(),
    marketingRetainers: z.number().optional()
});

type FixedCostFormValues = z.infer<typeof fixedCostSchema>;

export function FixedCostInputForm() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [selectedFields, setSelectedFields] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FixedCostFormValues>({
        resolver: zodResolver(fixedCostSchema),
        defaultValues: {}
    });

    const onSubmit = async (data: FixedCostFormValues) => {
        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([key]) => selectedFields.includes(key))
        );
        try {
            await axios.post('https://neura-ops.onrender.com/api/v1/financecost/fixed', filteredData, {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  });
            toast({ title: "Success", description: "Fixed cost entry saved." });
            navigate('/');
        } catch (error) {
            toast({ title: "Error", description: "Failed to save fixed cost entry.", variant: "destructive" });
        }
    };

    const fields = [
        { label: "Rent/Lease (Office/Shop/Factory/Warehouse)", key: "rentLeaseOfficeShopFactoryWarehouse" },
        { label: "Admin Salaries", key: "adminSalaries" },
        { label: "Owner Salary/Draw", key: "ownerSalaryDraw" },
        { label: "Statutory Contributions", key: "statutoryContributions" },
        { label: "Fixed Electricity Charges", key: "fixedElectricityCharges" },
        { label: "Water Base Charges", key: "waterBaseCharges" },
        { label: "Internet & Phones", key: "internetPhones" },
        { label: "Software Subscriptions", key: "softwareSubscriptions" },
        { label: "Loan EMIs", key: "loanEMIs" },
        { label: "Accounting & Audit Fees", key: "accountingAuditFees" },
        { label: "Legal & Compliance Fees", key: "legalComplianceFees" },
        { label: "Website Hosting & Domain", key: "websiteHostingDomain" },
        { label: "Insurance Premiums", key: "insurancePremiums" },
        { label: "Business Licenses", key: "businessLicenses" },
        { label: "AMC Contracts", key: "amcContracts" },
        { label: "Marketing Retainers", key: "marketingRetainers" },
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
                    <Package className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Fixed Costs Entry</h1>
                        <p className="text-muted-foreground">Select and add fixed costs</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => navigate('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>

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

            {/* Step 2: Show form only if fields selected */}
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
                                        <Label htmlFor={key} className="flex items-center gap-2">{label}</Label>
                                        <Input
                                            type="number"
                                            {...register(key as keyof FixedCostFormValues, { valueAsNumber: true })}
                                            className={errors[key as keyof FixedCostFormValues] ? "border-destructive" : ""}
                                        />
                                        {errors[key as keyof FixedCostFormValues] && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors[key as keyof FixedCostFormValues]?.message}
                                            </p>
                                        )}
                                    </div>
                                ))}
                        </CardContent>
                        <div className="flex justify-between p-6 pt-0">
                            <Button type="button" variant="outline" onClick={() => navigate('/')}>
                                Cancel
                            </Button>
                            <Button type="submit" className="gap-2">
                                <Save className="h-4 w-4" />
                                Save Fixed Cost
                            </Button>
                        </div>
                    </Card>
                </form>
            )}
        </div>
    );
}
