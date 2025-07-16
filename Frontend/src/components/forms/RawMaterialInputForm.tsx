import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import * as z from "zod";
import {
    ArrowLeft,
    Save,
    Package,
    Warehouse,
    ShoppingCart,
    Shield,
    AlertCircle
} from 'lucide-react';


 const rawMaterialSchema = z.object({
    rawMaterialName: z.string().min(1, "Material name is required"),
    rawMaterialCode: z.string().min(1, "Material code is required"),
    category: z.string().min(1, "Category is required"),
    preferredSuppliers: z.string().min(1, "Preferred suppliers are required"),
    supplierPartNumber: z.string().min(1, "Supplier part number is required"),
    purchaseUOM: z.string().min(1, "Purchase UOM is required"),
    leadTime: z.number().min(0, "Lead time must be positive"),
    minimumOrderQuantity: z.number().min(0, "Minimum order quantity must be positive"),
    pricePerUnit: z.number().min(0, "Price per unit must be positive"),
    lastPurchasePrice: z.number().min(0, "Last purchase price must be positive"),
    stockLocation: z.string().min(1, "Stock location is required"),
    currentStockLevel: z.number().min(0, "Current stock level must be positive"),
    reorderPoint: z.number().min(0, "Reorder point must be positive"),
    safetyStockLevel: z.number().min(0, "Safety stock level must be positive"),
    shelfLife: z.string().min(1, "Shelf life is required"),
    storageConditions: z.string().min(1, "Storage conditions are required"),
    scrapWastageRate: z.number().min(0, "Scrap wastage rate must be positive"),
    qualityStandards: z.string().min(1, "Quality standards are required"),
    msds: z.boolean(),
    testingRequirements: z.string().min(1, "Testing requirements are required")
  });
  
 type RawMaterialFormValues = z.infer<typeof rawMaterialSchema>;

const fieldGroups = {
    materialDetails: [
        { label: "Material Name", key: "rawMaterialName", type: "text", icon: Package },
        { label: "Material Code", key: "rawMaterialCode", type: "text", icon: Package },
        { label: "Category", key: "category", type: "text", icon: Package }
    ],
    stockInformation: [
        { label: "Stock Location", key: "stockLocation", type: "text", icon: Warehouse },
        { label: "Current Stock Level", key: "currentStockLevel", type: "number", icon: Warehouse },
        { label: "Reorder Point", key: "reorderPoint", type: "number", icon: Warehouse },
        { label: "Safety Stock Level", key: "safetyStockLevel", type: "number", icon: Warehouse },
        { label: "Shelf Life", key: "shelfLife", type: "text", icon: Warehouse },
        { label: "Storage Conditions", key: "storageConditions", type: "text", icon: Warehouse }
    ],
    procurementDetails: [
        { label: "Preferred Suppliers", key: "preferredSuppliers", type: "text", icon: ShoppingCart },
        { label: "Supplier Part Number", key: "supplierPartNumber", type: "text", icon: ShoppingCart },
        { label: "Purchase UOM", key: "purchaseUOM", type: "text", icon: ShoppingCart },
        { label: "Lead Time (Days)", key: "leadTime", type: "number", icon: ShoppingCart },
        { label: "Minimum Order Quantity", key: "minimumOrderQuantity", type: "number", icon: ShoppingCart },
        { label: "Price Per Unit", key: "pricePerUnit", type: "number", icon: ShoppingCart },
        { label: "Last Purchase Price", key: "lastPurchasePrice", type: "number", icon: ShoppingCart }
    ],
    qualityDetails: [
        { label: "Quality Standards", key: "qualityStandards", type: "text", icon: Shield },
        { label: "Testing Requirements", key: "testingRequirements", type: "text", icon: Shield },
        { label: "MSDS Available", key: "msds", type: "boolean", icon: Shield }
    ],
};

export function RawMaterialInputForm() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("materialDetails");
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<RawMaterialFormValues>({
        resolver: zodResolver(rawMaterialSchema),
        defaultValues: {
            rawMaterialName: '',
            rawMaterialCode: '',
            category: '',
            preferredSuppliers: '',
            supplierPartNumber: '',
            purchaseUOM: '',
            leadTime: 0,
            minimumOrderQuantity: 0,
            pricePerUnit: 0,
            lastPurchasePrice: 0,
            stockLocation: '',
            currentStockLevel: 0,
            reorderPoint: 0,
            safetyStockLevel: 0,
            shelfLife: '',
            storageConditions: '',
            scrapWastageRate: 0,
            qualityStandards: '',
            msds: false,
            testingRequirements: ''
        }
    });

    const onSubmit = async (data: RawMaterialFormValues) => {
        try {
            await axios.post('https://neura-ops.onrender.com/api/v1/rawmaterial', data, 
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            toast({
                title: "Success",
                description: "Raw material data has been saved successfully.",
            });
            navigate('/');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save raw material data. Please try again.",
                variant: "destructive"
            });
        }
    };

    const renderField = ({ label, key, type, icon: Icon }: any) => {
        const error = errors[key as keyof RawMaterialFormValues];

        if (type === "boolean") {
            return (
                <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {label}
                        </Label>
                        <Switch
                            checked={watch(key as keyof RawMaterialFormValues) as boolean}
                            onCheckedChange={(checked) => setValue(key as keyof RawMaterialFormValues, checked)}
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {error.message}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <div key={key} className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                </Label>
                <Input
                    type={type}
                    {...register(key as keyof RawMaterialFormValues, {
                        valueAsNumber: type === "number"
                    })}
                    className={error ? "border-destructive" : ""}
                />
                {error && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {error.message}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="w-screen container mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between bg-background p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <Package className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Raw Material Entry</h1>
                        <p className="text-muted-foreground">Add new raw material details to the system</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => navigate('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="materialDetails" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Material Details
                        </TabsTrigger>
                        <TabsTrigger value="stockInformation" className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4" />
                            Stock Info
                        </TabsTrigger>
                        <TabsTrigger value="procurementDetails" className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Procurement
                        </TabsTrigger>
                        <TabsTrigger value="qualityDetails" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Quality Details
                        </TabsTrigger>
                    </TabsList>

                    {Object.entries(fieldGroups).map(([tabKey, fields]) => (
                        <TabsContent key={tabKey} value={tabKey}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {tabKey === "materialDetails" && <Package className="h-5 w-5" />}
                                        {tabKey === "stockInformation" && <Warehouse className="h-5 w-5" />}
                                        {tabKey === "procurementDetails" && <ShoppingCart className="h-5 w-5" />}
                                        {tabKey === "qualityDetails" && <Shield className="h-5 w-5" />}
                                        {tabKey.replace(/([A-Z])/g, ' $1').trim()}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {fields.map(renderField)}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>

                <div className="flex justify-between pt-6">
                    <Button type="button" variant="outline" onClick={() => navigate('/')}>
                        Cancel
                    </Button>
                    <Button type="submit" className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Raw Material
                    </Button>
                </div>
            </form>
        </div>
    );
}