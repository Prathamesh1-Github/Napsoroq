import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { z } from "zod";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
    ArrowLeft, 
    Save,
    Package,
    Boxes,
    Calendar,
    Building2,
    Warehouse,
    DollarSign,
    Scale,
    AlertCircle
} from "lucide-react";

const rawMaterialStockSchema = z.object({
    rawMaterialId: z.string().min(1, "Raw material selection is required"),
    batchNumber: z.string().min(1, "Batch number is required"),
    dateReceived: z.string().min(1, "Date received is required"),
    expiryDate: z.string().min(1, "Expiry date is required"),
    quantityReceived: z.number().min(0.1, "Quantity must be greater than 0"),
    unitOfMeasurement: z.string().min(1, "Unit of measurement is required"),
    pricePerUnit: z.number().min(0.01, "Price must be greater than 0"),
    totalCost: z.number(),
    stockLocation: z.string().min(1, "Stock location is required"),
    supplierName: z.string().min(1, "Supplier selection is required"),
});

type RawMaterialStockForm = z.infer<typeof rawMaterialStockSchema>;

interface ValidationError {
    [key: string]: string[];
}

export function RawMaterialStockInputForm() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("stockDetails");

    const [formData, setFormData] = useState<RawMaterialStockForm>({
        rawMaterialId: "",
        batchNumber: "",
        dateReceived: "",
        expiryDate: "",
        quantityReceived: 0,
        unitOfMeasurement: "",
        pricePerUnit: 0,
        totalCost: 0,
        stockLocation: "",
        supplierName: "",
    });

    const [errors, setErrors] = useState<ValidationError>({});
    const [rawMaterials, setRawMaterials] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<string[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [rawMaterialRes, supplierRes] = await Promise.all([
                    axios.get("https://neura-ops.onrender.com/api/v1/rawmaterial", 
                        {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                    ),
                    axios.get("https://neura-ops.onrender.com/api/v1/suppliers", 
                        {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                    ),
                ]);
                setRawMaterials(rawMaterialRes.data.rawMaterials);
                setSuppliers(supplierRes.data.suppliers.map((supplier: any) => supplier.supplierName));
            } catch (error) {
                toast({
                    title: "Error fetching data",
                    description: "Could not load data",
                    variant: "destructive",
                });
            }
        }
        fetchData();
    }, [toast]);

    const validateField = (field: keyof RawMaterialStockForm, value: any) => {
        try {
            const schema = rawMaterialStockSchema.shape[field];
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

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, key: keyof RawMaterialStockForm) => {
        const { value, type } = e.target;
        let updatedValue = type === "number" ? Number(value) : value;

        setFormData((prev) => {
            let newTotalCost = prev.totalCost;
            if (key === "quantityReceived" || key === "pricePerUnit") {
                const quantity = key === "quantityReceived" ? Number(updatedValue) : Number(prev.quantityReceived);
                const price = key === "pricePerUnit" ? Number(updatedValue) : Number(prev.pricePerUnit);
                newTotalCost = quantity * price;
            }
            const newData = { ...prev, [key]: updatedValue, totalCost: newTotalCost };
            validateField(key, updatedValue);
            return newData;
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const validatedData = rawMaterialStockSchema.parse(formData);
            
            await axios.post("https://neura-ops.onrender.com/api/v1/rawmaterialstock", validatedData, 
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            await axios.post("https://neura-ops.onrender.com/api/v1/rawmaterial/update-stock", {
                rawMaterialCode: validatedData.rawMaterialId,
                quantityReceived: validatedData.quantityReceived,
            }, 
            {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
        );

            toast({
                title: "Stock intake saved successfully",
                description: "New stock intake has been recorded, and stock level updated.",
            });
            navigate("/");
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
                    description: "Please check the form for errors.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error saving stock intake",
                    description: "Please try again.",
                    variant: "destructive",
                });
            }
        }
    };

    const renderError = (field: keyof RawMaterialStockForm) => {
        if (errors[field]) {
            return (
                <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors[field][0]}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 w-screen p-6 = mx-auto">
            <div className="flex items-center justify-between bg-background p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <Boxes className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Raw Material Stock Intake</h1>
                </div>
                <Button variant="outline" onClick={() => navigate("/")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="bg-background rounded-lg shadow-sm">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 p-1">
                        <TabsTrigger value="stockDetails">
                            <Package className="mr-2 h-4 w-4" />
                            Stock Details
                        </TabsTrigger>
                        <TabsTrigger value="supplierDetails">
                            <Building2 className="mr-2 h-4 w-4" />
                            Supplier & Cost
                        </TabsTrigger>
                        <TabsTrigger value="storage">
                            <Warehouse className="mr-2 h-4 w-4" />
                            Storage Info
                        </TabsTrigger>
                    </TabsList>

                    {/* Stock Details */}
                    <TabsContent value="stockDetails">
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle>Stock Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-primary" />
                                        Raw Material
                                    </Label>
                                    <Select 
                                        value={formData.rawMaterialId}
                                        onValueChange={(value) => {
                                            setFormData(prev => ({ ...prev, rawMaterialId: value }));
                                            validateField("rawMaterialId", value);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a raw material" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rawMaterials.map((material) => (
                                                <SelectItem key={material.rawMaterialCode} value={material.rawMaterialCode}>
                                                    {material.rawMaterialName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {renderError("rawMaterialId")}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-primary" />
                                        Batch Number
                                    </Label>
                                    <Input 
                                        type="text"
                                        placeholder="Enter batch number"
                                        value={formData.batchNumber}
                                        onChange={(e) => handleInputChange(e, "batchNumber")}
                                    />
                                    {renderError("batchNumber")}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            Date Received
                                        </Label>
                                        <Input 
                                            type="date"
                                            value={formData.dateReceived}
                                            onChange={(e) => handleInputChange(e, "dateReceived")}
                                        />
                                        {renderError("dateReceived")}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            Expiry Date
                                        </Label>
                                        <Input 
                                            type="date"
                                            value={formData.expiryDate}
                                            onChange={(e) => handleInputChange(e, "expiryDate")}
                                        />
                                        {renderError("expiryDate")}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t p-6">
                                <Button 
                                    type="button"
                                    onClick={() => setActiveTab("supplierDetails")}
                                    className="ml-auto"
                                >
                                    Next: Supplier & Cost
                                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Supplier & Costing */}
                    <TabsContent value="supplierDetails">
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle>Supplier & Costing Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        Supplier Name
                                    </Label>
                                    <Select 
                                        value={formData.supplierName}
                                        onValueChange={(value) => {
                                            setFormData(prev => ({ ...prev, supplierName: value }));
                                            validateField("supplierName", value);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((supplier, index) => (
                                                <SelectItem key={index} value={supplier}>
                                                    {supplier}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {renderError("supplierName")}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Scale className="h-4 w-4 text-primary" />
                                            Quantity Received
                                        </Label>
                                        <Input 
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Enter quantity"
                                            value={formData.quantityReceived}
                                            onChange={(e) => handleInputChange(e, "quantityReceived")}
                                        />
                                        {renderError("quantityReceived")}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Scale className="h-4 w-4 text-primary" />
                                            Unit of Measurement
                                        </Label>
                                        <Input 
                                            type="text"
                                            placeholder="Enter unit (kg, L, etc.)"
                                            value={formData.unitOfMeasurement}
                                            onChange={(e) => handleInputChange(e, "unitOfMeasurement")}
                                        />
                                        {renderError("unitOfMeasurement")}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-primary" />
                                            Price Per Unit (₹)
                                        </Label>
                                        <Input 
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Enter price per unit"
                                            value={formData.pricePerUnit}
                                            onChange={(e) => handleInputChange(e, "pricePerUnit")}
                                        />
                                        {renderError("pricePerUnit")}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-primary" />
                                            Total Cost (₹)
                                        </Label>
                                        <Input 
                                            type="number"
                                            value={formData.totalCost}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t p-6 flex justify-between">
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab("stockDetails")}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Stock Details
                                </Button>
                                <Button 
                                    type="button"
                                    onClick={() => setActiveTab("storage")}
                                >
                                    Next: Storage Info
                                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Storage Information */}
                    <TabsContent value="storage">
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle>Storage Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Warehouse className="h-4 w-4 text-primary" />
                                        Stock Location
                                    </Label>
                                    <Input 
                                        type="text"
                                        placeholder="Enter storage location"
                                        value={formData.stockLocation}
                                        onChange={(e) => handleInputChange(e, "stockLocation")}
                                    />
                                    {renderError("stockLocation")}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t p-6 flex justify-between">
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab("supplierDetails")}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Supplier & Cost
                                </Button>
                                <Button type="submit">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Stock Intake
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    );
}

export default RawMaterialStockInputForm;