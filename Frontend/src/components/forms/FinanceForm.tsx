import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { 
    ArrowLeft, 
    Save, 
    AlertCircle,
    DollarSign,
    Factory,
    Truck,
    Package,
    Wrench,
    Megaphone,
    Building,
    Warehouse,
    ShoppingCart,
    BarChart,
    IndianRupee,
    ArrowRight
} from 'lucide-react';

const revenueSchema = z.object({
    rawMaterialCost: z.number().min(0, "Cost cannot be negative"),
    laborCost: z.number().min(0, "Cost cannot be negative"),
    overheadCosts: z.number().min(0, "Cost cannot be negative"),
    packagingCost: z.number().min(0, "Cost cannot be negative"),
    shippingLogisticsCost: z.number().min(0, "Cost cannot be negative"),
    utilityCost: z.number().min(0, "Cost cannot be negative"),
    machineMaintenanceCost: z.number().min(0, "Cost cannot be negative"),
    marketingAdvertisingExpense: z.number().min(0, "Cost cannot be negative"),
    totalFixedCost: z.number().min(0, "Cost cannot be negative"),
    warehousingStorageCost: z.number().min(0, "Cost cannot be negative"),
    costOfGoodsSold: z.number().min(0, "Cost cannot be negative")
});

type RevenueForm = z.infer<typeof revenueSchema>;

interface ValidationError {
    [key: string]: string[];
}

interface Field {
    label: string;
    key: keyof RevenueForm;
    type: string;
    icon: React.ComponentType;
    placeholder: string;
}

interface FieldGroups {
    costExpenses: Field[];
    inventorySupplyChain: Field[];
}

const fieldGroups: FieldGroups = {
    costExpenses: [
        { label: "Raw Material Cost (₹)", key: "rawMaterialCost", type: "number", icon: Factory, placeholder: "Enter raw material cost" },
        { label: "Labor Cost (₹)", key: "laborCost", type: "number", icon: DollarSign, placeholder: "Enter labor cost" },
        { label: "Overhead Costs (₹)", key: "overheadCosts", type: "number", icon: Building, placeholder: "Enter overhead costs" },
        { label: "Packaging Cost (₹)", key: "packagingCost", type: "number", icon: Package, placeholder: "Enter packaging cost" },
        { label: "Shipping & Logistics Cost (₹)", key: "shippingLogisticsCost", type: "number", icon: Truck, placeholder: "Enter shipping cost" },
        { label: "Utility Cost (₹)", key: "utilityCost", type: "number", icon: DollarSign, placeholder: "Enter utility cost" },
        { label: "Machine Maintenance Cost (₹)", key: "machineMaintenanceCost", type: "number", icon: Wrench, placeholder: "Enter maintenance cost" },
        { label: "Marketing & Advertising Expense (₹)", key: "marketingAdvertisingExpense", type: "number", icon: Megaphone, placeholder: "Enter marketing cost" },
        { label: "Total Fixed Cost (₹)", key: "totalFixedCost", type: "number", icon: BarChart, placeholder: "Enter fixed cost" }
    ],
    inventorySupplyChain: [
        { label: "Warehousing & Storage Cost (₹)", key: "warehousingStorageCost", type: "number", icon: Warehouse, placeholder: "Enter warehousing cost" },
        { label: "Cost of Goods Sold (₹)", key: "costOfGoodsSold", type: "number", icon: ShoppingCart, placeholder: "Enter COGS" }
    ]
};

export function FinanceForm() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("costExpenses");
    const [errors, setErrors] = useState<ValidationError>({});
    
    const [formData, setFormData] = useState<RevenueForm>({
        rawMaterialCost: 0,
        laborCost: 0,
        overheadCosts: 0,
        packagingCost: 0,
        shippingLogisticsCost: 0,
        utilityCost: 0,
        machineMaintenanceCost: 0,
        marketingAdvertisingExpense: 0,
        totalFixedCost: 0,
        warehousingStorageCost: 0,
        costOfGoodsSold: 0
    });

    const validateField = (field: keyof RevenueForm, value: any) => {
        try {
            const schema = revenueSchema.shape[field];
            schema.parse(value);
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors(prev => ({
                    ...prev,
                    [field]: error.errors.map(e => e.message)
                }));
            }
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, key: keyof RevenueForm) => {
        const { value, type } = e.target;
        const numValue = type === "number" ? (value ? Number(value) : 0) : value;
        setFormData(prev => ({
            ...prev,
            [key]: numValue
        }));
        validateField(key, numValue);
    };

    const renderError = (field: keyof RevenueForm) => {
        if (errors[field]) {
            return (
                <div className="text-destructive text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors[field][0]}
                </div>
            );
        }
        return null;
    };

    const calculateProgress = () => {
        const totalFields = Object.values(fieldGroups).flat().length;
        const filledFields = Object.values(formData).filter(value => value > 0).length;
        return (filledFields / totalFields) * 100;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const validatedData = revenueSchema.parse(formData);
            await axios.post('https://neura-ops.onrender.com/api/v1/finance', validatedData, {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  });
            toast({ 
                title: "Success!",
                description: "Financial data has been saved successfully.",
            });
            navigate('/');
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: ValidationError = {};
                error.errors.forEach(err => {
                    const path = err.path[0] as string;
                    if (!newErrors[path]) {
                        newErrors[path] = [];
                    }
                    newErrors[path].push(err.message);
                });
                setErrors(newErrors);
                toast({
                    title: "Validation Error",
                    description: "Please check all fields for errors.",
                    variant: "destructive"
                });
            } else {
                toast({ 
                    title: "Error",
                    description: "Failed to save financial data. Please try again.",
                    variant: "destructive"
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-background/95 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between bg-card p-6 rounded-lg shadow-lg border border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <IndianRupee className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Revenue & Profitability</h1>
                            <p className="text-muted-foreground">Track and manage your financial metrics</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Button>
                </div>

                <div className="bg-card p-4 rounded-lg shadow-lg border border-border/50">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Form completion</span>
                            <span className="text-primary font-medium">{Math.round(calculateProgress())}%</span>
                        </div>
                        <Progress value={calculateProgress()} className="h-2" />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2 h-14">
                                <TabsTrigger value="costExpenses" className="data-[state=active]:bg-primary/10">
                                    <DollarSign className="mr-2 h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Cost & Expenses</div>
                                        <span className="text-xs text-muted-foreground">Operating costs and expenses</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger value="inventorySupplyChain" className="data-[state=active]:bg-primary/10">
                                    <Warehouse className="mr-2 h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Inventory & Supply Chain</div>
                                        <span className="text-xs text-muted-foreground">Storage and goods costs</span>
                                    </div>
                                </TabsTrigger>
                            </TabsList>

                            {Object.entries(fieldGroups).map(([tabKey, fields]) => (
                                <TabsContent key={tabKey} value={tabKey}>
                                    <Card className="border-border/50">
                                        <CardHeader className="border-b border-border/50">
                                            <CardTitle className="flex items-center gap-2 text-xl">
                                                {tabKey === 'costExpenses' ? 
                                                    <DollarSign className="h-5 w-5 text-primary" /> : 
                                                    <Warehouse className="h-5 w-5 text-primary" />
                                                }
                                                {tabKey.replace(/([A-Z])/g, ' $1').trim()}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid md:grid-cols-2 gap-6 p-6">
                                            {fields.map(({ label, key, type, icon, placeholder }: Field) => {
                                                const Icon = icon as React.ElementType;
                                                return (
                                                    <div key={key} className="space-y-2">
                                                        <Label className="flex items-center gap-2 text-muted-foreground">
                                                            <Icon className="h-4 w-4 text-primary" />
                                                            {label}
                                                        </Label>
                                                        <div className="relative">
                                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                type={type}
                                                                placeholder={placeholder}
                                                                value={formData[key] || ''}
                                                                onChange={(e) => handleInputChange(e, key)}
                                                                min="0"
                                                                step="0.01"
                                                                className={`pl-9 ${errors[key] ? 'border-destructive' : 'focus:border-primary'}`}
                                                            />
                                                        </div>
                                                        {renderError(key)}
                                                    </div>
                                                );
                                            })}
                                        </CardContent>
                                        <CardFooter className="border-t border-border/50 p-6 flex justify-between">
                                            {tabKey === 'costExpenses' ? (
                                                <div className="flex justify-end w-full">
                                                    <Button
                                                        type="button"
                                                        onClick={() => setActiveTab("inventorySupplyChain")}
                                                        className="gap-2"
                                                    >
                                                        Next: Inventory & Supply Chain
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between w-full">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setActiveTab("costExpenses")}
                                                        className="gap-2"
                                                    >
                                                        <ArrowLeft className="h-4 w-4" />
                                                        Back to Costs
                                                    </Button>
                                                    <Button 
                                                        type="submit"
                                                        className="gap-2 bg-primary hover:bg-primary/90"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                        Save Data
                                                    </Button>
                                                </div>
                                            )}
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default FinanceForm;