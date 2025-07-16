import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Package,
    Save,
    ArrowLeft,
    Building2,
    Scale,
    MapPin,
    ClipboardCheck,
    Plus,
    X,
    Boxes,
    Wrench,
    Users,
    Loader2
} from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Checkbox
} from "@/components/ui/checkbox";
import {
    Textarea
} from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const semiFinishedProductSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    productName: z.string().min(1, "Product name is required"),
    productCategory: z.string().min(1, "Product category is required"),
    productSKU: z.string().min(1, "Product SKU is required"),
    uom: z.string().min(1, "Product UOM is required"),
    productVariant: z.string().optional(),
    batchSize: z.number().min(1, "Batch size must be greater than 0"),
    productWeight: z.number().min(0, "Product weight must be non-negative"),
    totalMaterialCost: z.number().min(0, "Material cost must be non-negative"),
    laborCost: z.number().min(0, "Labor cost must be non-negative"),
    machineCost: z.number().min(0, "Machine cost must be non-negative"),
    overheadCost: z.number().min(0, "Overhead cost must be non-negative"),
    profitMargin: z.number().min(0, "Profit margin must be non-negative"),
    currentStock: z.number().min(0, "Current stock must be non-negative"),
    minimumStockLevel: z.number().min(0, "Minimum stock level must be non-negative"),
    reorderPoint: z.number().min(0, "Reorder point must be non-negative"),
    leadTime: z.number().min(0, "Lead time must be non-negative"),
    qualityCheckRequired: z.boolean(),
    inspectionCriteria: z.string().optional(),
    defectTolerance: z.number().min(0, "Defect tolerance must be non-negative"),
    rawMaterials: z.array(z.object({
        rawMaterialId: z.string(),
        rawMaterialName: z.string(),
        quantity: z.number().min(0)
    })).optional(),
    semiFinishedComponents: z.array(z.object({
        productId: z.string(),
        productName: z.string(),
        quantity: z.number().min(0)
    })).optional(),
    machines: z.array(z.object({
        machineId: z.string(),
        machineName: z.string(),
        cycleTime: z.number().min(0),
        productsProducedInOneCycleTime: z.number().min(1)
    })).optional(),
    manualJobs: z.array(z.object({
        jobId: z.string(),
        jobName: z.string(),
        expectedTimePerUnit: z.number().min(0)
    })).optional()
});

type SemiFinishedProductForm = z.infer<typeof semiFinishedProductSchema>;
type ValidationError = { [key: string]: string[] };

interface RawMaterial {
    _id: string;
    rawMaterialName: string;
    rawMaterialCode: string;
    category: string;
    preferredSuppliers: string[];
    supplierPartNumber: string;
    purchaseUOM: string;
    leadTime: number;
    minimumOrderQuantity: number;
    pricePerUnit: number;
    lastPurchasePrice: number;
    stockLocation: string;
    currentStockLevel: number;
    reorderPoint: number;
    safetyStockLevel: number;
    shelfLife: string | null;
    storageConditions: string;
    qualityStandards: string[];
    testingRequirements: boolean;
    msds: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface SemiFinishedProduct {
    _id: string;
    productName: string;
    uom: string;
    productCategory: string;
    productSKU: string;
    unitOfMeasure?: string;
}

interface Machine {
    _id: string;
    machineName: string;
    department: string;
}

interface ManualJob {
    _id: string;
    jobName: string;
    department: string;
    jobType: string;
}

export function SemiFinishedProductForm() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [errors, setErrors] = useState<ValidationError>({});
    const [loading, setLoading] = useState(false);
    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
    const [semiFinishedProducts, setSemiFinishedProducts] = useState<SemiFinishedProduct[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [manualJobs, setManualJobs] = useState<ManualJob[]>([]);
    const [selectedRawMaterial, setSelectedRawMaterial] = useState<string>("");
    const [selectedRawMaterialQuantity, setSelectedRawMaterialQuantity] = useState<number>();
    const [selectedSemiFinishedProduct, setSelectedSemiFinishedProduct] = useState<string>("");
    const [selectedSemiFinishedProductQuantity, setSelectedSemiFinishedProductQuantity] = useState<number>();
    const [selectedMachine, setSelectedMachine] = useState<string>("");
    const [selectedMachineCycleTime, setSelectedMachineCycleTime] = useState<number>();
    const [selectedMachineProductsPerCycle, setSelectedMachineProductsPerCycle] = useState<number>();
    const [selectedManualJob, setSelectedManualJob] = useState<string>("");
    const [selectedManualJobTime, setSelectedManualJobTime] = useState<number>();
    const [activeTab, setActiveTab] = useState("basicInfo");

    const form = useForm<SemiFinishedProductForm>({
        defaultValues: {
            productId: "",
            productName: "",
            productCategory: "",
            productSKU: "",
            uom: "",
            productVariant: "",
            batchSize: 0,
            productWeight: 0,
            totalMaterialCost: 0,
            laborCost: 0,
            machineCost: 0,
            overheadCost: 0,
            profitMargin: 0,
            currentStock: 0,
            minimumStockLevel: 0,
            reorderPoint: 0,
            leadTime: 0,
            qualityCheckRequired: false,
            inspectionCriteria: "",
            defectTolerance: 0,
            rawMaterials: [],
            semiFinishedComponents: [],
            machines: [],
            manualJobs: []
        },
        resolver: zodResolver(semiFinishedProductSchema)
    });

    useEffect(() => {
        fetchRawMaterials();
        fetchSemiFinishedProducts();
        fetchMachines();
        fetchManualJobs();
    }, []);

    const fetchRawMaterials = async () => {
        try {
            setLoading(true);
            const response = await axios.get("https://neura-ops.onrender.com/api/v1/rawmaterial", 
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            setRawMaterials(response.data.rawMaterials || []);
        } catch (error) {
            console.error("Error fetching raw materials:", error);
            toast({
                title: "Error",
                description: "Failed to fetch raw materials. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSemiFinishedProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get("https://neura-ops.onrender.com/api/v1/semifinished",
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            setSemiFinishedProducts(response.data.products || []);
        } catch (error) {
            console.error("Error fetching semi-finished products:", error);
            toast({
                title: "Error",
                description: "Failed to fetch semi-finished products. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchMachines = async () => {
        try {
            setLoading(true);
            const response = await axios.get("https://neura-ops.onrender.com/api/v1/machine",
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            setMachines(response.data.machines || []);
        } catch (error) {
            console.error("Error fetching machines:", error);
            toast({
                title: "Error",
                description: "Failed to fetch machines. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchManualJobs = async () => {
        try {
            setLoading(true);
            const response = await axios.get("https://neura-ops.onrender.com/api/v1/manualjob",
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            setManualJobs(response.data.jobs || []);
        } catch (error) {
            console.error("Error fetching manual jobs:", error);
            toast({
                title: "Error",
                description: "Failed to fetch manual jobs. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    console.log(errors);
    if(loading){
        return <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }

    const addRawMaterial = () => {
        if (!selectedRawMaterial || (selectedRawMaterialQuantity ?? 0) <= 0) {
            toast({
                title: "Error",
                description: "Please select a raw material and specify a quantity.",
                variant: "destructive",
            });
            return;
        }

        const material = rawMaterials.find(m => m._id === selectedRawMaterial);
        if (!material) return;

        const currentMaterials = form.getValues("rawMaterials") || [];
        const materialExists = currentMaterials.some(m => m.rawMaterialId === material.rawMaterialCode);

        if (materialExists) {
            toast({
                title: "Error",
                description: "This raw material is already added to the list.",
                variant: "destructive",
            });
            return;
        }

        form.setValue("rawMaterials", [
            ...currentMaterials,
            {
                rawMaterialId: material.rawMaterialCode,
                rawMaterialName: material.rawMaterialName,
                quantity: (selectedRawMaterialQuantity ?? 0)
            }
        ]);

        setSelectedRawMaterial("");
        setSelectedRawMaterialQuantity(0);
    };

    const removeRawMaterial = (materialId: string) => {
        const currentMaterials = form.getValues("rawMaterials") || [];
        form.setValue(
            "rawMaterials",
            currentMaterials.filter(m => m.rawMaterialId !== materialId)
        );
    };

    const addSemiFinishedProduct = () => {
        if (!selectedSemiFinishedProduct || (selectedSemiFinishedProductQuantity ?? 0) <= 0) {
            toast({
                title: "Error",
                description: "Please select a semi-finished product and specify a quantity.",
                variant: "destructive",
            });
            return;
        }

        const product = semiFinishedProducts.find(p => p._id === selectedSemiFinishedProduct);
        if (!product) return;

        const currentProducts = form.getValues("semiFinishedComponents") || [];
        const productExists = currentProducts.some(p => p.productId === selectedSemiFinishedProduct);

        if (productExists) {
            toast({
                title: "Error",
                description: "This semi-finished product is already added to the list.",
                variant: "destructive",
            });
            return;
        }

        form.setValue("semiFinishedComponents", [
            ...currentProducts,
            {
                productId: selectedSemiFinishedProduct,
                productName: product.productName,
                quantity: (selectedSemiFinishedProductQuantity ?? 0)
            }
        ]);

        setSelectedSemiFinishedProduct("");
        setSelectedSemiFinishedProductQuantity(0);
    };

    const removeSemiFinishedProduct = (productId: string) => {
        const currentProducts = form.getValues("semiFinishedComponents") || [];
        form.setValue(
            "semiFinishedComponents",
            currentProducts.filter(p => p.productId !== productId)
        );
    };

    const addMachine = () => {
        if (!selectedMachine) return;

        const machine = machines.find(m => m._id === selectedMachine);
        if (!machine) return;

        const currentMachines = form.getValues("machines") || [];
        const machineExists = currentMachines.some(m => m.machineId === selectedMachine);

        if (machineExists) {
            toast({
                title: "Error",
                description: "This machine has already been added.",
                variant: "destructive",
            });
            return;
        }

        form.setValue("machines", [
            ...currentMachines,
            {
                machineId: selectedMachine,
                machineName: machine.machineName,
                cycleTime: (selectedMachineCycleTime ?? 0),
                productsProducedInOneCycleTime: (selectedMachineProductsPerCycle ?? 1)
            }
        ]);

        setSelectedMachine("");
        setSelectedMachineCycleTime(0);
        setSelectedMachineProductsPerCycle(1);
    };

    const removeMachine = (machineId: string) => {
        const currentMachines = form.getValues("machines") || [];
        form.setValue(
            "machines",
            currentMachines.filter(m => m.machineId !== machineId)
        );
    };

    const addManualJob = () => {
        if (!selectedManualJob || (selectedManualJobTime ?? 0) <= 0) {
            toast({
                title: "Error",
                description: "Please select a manual job and specify an expected time.",
                variant: "destructive",
            });
            return;
        }

        const job = manualJobs.find(j => j._id === selectedManualJob);
        if (!job) return;

        const currentJobs = form.getValues("manualJobs") || [];
        const jobExists = currentJobs.some(j => j.jobId === selectedManualJob);

        if (jobExists) {
            toast({
                title: "Error",
                description: "This manual job is already added to the list.",
                variant: "destructive",
            });
            return;
        }

        form.setValue("manualJobs", [
            ...currentJobs,
            {
                jobId: selectedManualJob,
                jobName: job.jobName,
                expectedTimePerUnit: (selectedManualJobTime ?? 0)
            }
        ]);

        setSelectedManualJob("");
        setSelectedManualJobTime(0);
    };

    const removeManualJob = (jobId: string) => {
        const currentJobs = form.getValues("manualJobs") || [];
        form.setValue(
            "manualJobs",
            currentJobs.filter(j => j.jobId !== jobId)
        );
    };

    const onSubmit = async (data: SemiFinishedProductForm) => {
        try {
            const response = await axios.post("https://neura-ops.onrender.com/api/v1/semifinished", data,
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );

            if (response.status === 201) {
                toast({
                    title: "Success",
                    description: "Semi-finished product created successfully",
                });
                navigate("/semi-finished");
            }
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
            }
            toast({
                title: "Error",
                description: "Failed to create semi-finished product. Please check the form for errors.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6 w-screen p-6 mx-auto">
            <div className="flex items-center justify-between bg-background p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <Package className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Create Semi-Finished Product</h1>
                </div>
                <Button variant="outline" onClick={() => navigate("/semi-finished")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
                            <TabsTrigger value="basicInfo" className="flex items-center gap-2">
                                <Package className="h-4 w-4" /> Basic Info
                            </TabsTrigger>
                            <TabsTrigger value="productionDetails" className="flex items-center gap-2">
                                <Scale className="h-4 w-4" /> Production
                            </TabsTrigger>
                            <TabsTrigger value="costing" className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" /> Costing
                            </TabsTrigger>
                            <TabsTrigger value="inventory" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Inventory
                            </TabsTrigger>
                            <TabsTrigger value="quality" className="flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4" /> Quality
                            </TabsTrigger>
                            <TabsTrigger value="materials" className="flex items-center gap-2">
                                <Boxes className="h-4 w-4" /> Materials
                            </TabsTrigger>
                            <TabsTrigger value="resources" className="flex items-center gap-2">
                                <Wrench className="h-4 w-4" /> Resources
                            </TabsTrigger>
                        </TabsList>

                        {/* Basic Information Tab */}
                        <TabsContent value="basicInfo">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="productId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product ID</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter product ID" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="productName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter product name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="productCategory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Category</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter product category" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="productSKU"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product SKU</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter product SKU" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="uom"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product UOM</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select UOM" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="units">Units</SelectItem>
                                                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                                                        <SelectItem value="g">Gram (g)</SelectItem>
                                                        <SelectItem value="L">Litre (l)</SelectItem>
                                                        <SelectItem value="ml">Millilitre (ml)</SelectItem>
                                                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="productVariant"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Variant</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter product variant" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Production Details Tab */}
                        <TabsContent value="productionDetails">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Scale className="h-5 w-5 text-primary" />
                                        Production Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="batchSize"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Batch Size</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="1" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="productWeight"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Weight (kg)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Costing Tab */}
                        <TabsContent value="costing">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-primary" />
                                        Cost Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="totalMaterialCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total Material Cost</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="laborCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Labor Cost</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="machineCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Machine Cost</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="overheadCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Overhead Cost</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="profitMargin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Profit Margin (%)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Inventory Tab */}
                        <TabsContent value="inventory">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        Inventory Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="currentStock"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Current Stock
                                                    {form.watch("uom") && <span className="text-muted-foreground"> ({form.watch("uom")})</span>}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="minimumStockLevel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Minimum Stock Level
                                                    {form.watch("uom") && <span className="text-muted-foreground"> ({form.watch("uom")})</span>}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="reorderPoint"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Reorder Point
                                                    {form.watch("uom") && <span className="text-muted-foreground"> ({form.watch("uom")})</span>}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="leadTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lead Time (days)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Quality Tab */}
                        <TabsContent value="quality">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ClipboardCheck className="h-5 w-5 text-primary" />
                                        Quality Control
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="qualityCheckRequired"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Quality Check Required</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="inspectionCriteria"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>Inspection Criteria</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Enter inspection criteria" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="defectTolerance"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Defect Tolerance (%)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Materials Tab */}
                        <TabsContent value="materials">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Raw Materials */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Boxes className="h-5 w-5 text-primary" />
                                            Raw Materials
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Label>Select Raw Material</Label>
                                                <Select
                                                    value={selectedRawMaterial}
                                                    onValueChange={setSelectedRawMaterial}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a raw material" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {rawMaterials.map((material) => (
                                                            <SelectItem key={material._id} value={material._id}>
                                                                {material.rawMaterialName} ({material.rawMaterialCode})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-32">
                                                <Label>Quantity {selectedRawMaterial && (
                                        <span className="text-muted-foreground">({rawMaterials.find(m => m.rawMaterialCode === selectedRawMaterial)?.purchaseUOM})</span>
                                    )}</Label>
                                                <Input
                                                    type="number"
                                                    placeholder={
                                                        selectedRawMaterial
                                                            ? `Enter quantity in ${rawMaterials.find(m => m.rawMaterialCode === selectedRawMaterial)?.purchaseUOM}`
                                                            : "Enter quantity"
                                                    }
                                                    value={selectedRawMaterialQuantity}
                                                    onChange={(e) => setSelectedRawMaterialQuantity(Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button type="button" onClick={addRawMaterial}>
                                                    <Plus className="h-4 w-4 mr-1" /> Add
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Material Name</TableHead>
                                                        <TableHead>Quantity</TableHead>
                                                        <TableHead className="w-[100px]">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {form.watch("rawMaterials")?.map((material) => (
                                                        <TableRow key={material.rawMaterialId}>
                                                            <TableCell>{material.rawMaterialName} ({material.rawMaterialId})</TableCell>
                                                            <TableCell>{material.quantity} {rawMaterials.find(m => m.rawMaterialCode === material.rawMaterialId)?.purchaseUOM}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeRawMaterial(material.rawMaterialId)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {(!form.watch("rawMaterials") || form.watch("rawMaterials")?.length === 0) && (
                                                        <TableRow>
                                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                                No raw materials added
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Semi-Finished Components */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Boxes className="h-5 w-5 text-primary" />
                                            Semi-Finished Components
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Label>Select Semi-Finished Product</Label>
                                                <Select
                                                    value={selectedSemiFinishedProduct}
                                                    onValueChange={setSelectedSemiFinishedProduct}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a semi-finished product" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {semiFinishedProducts.map((product) => (
                                                            <SelectItem key={product._id} value={product._id}>
                                                                {product.productName} ({product.uom || 'N/A'})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-32">
                                                <Label>Quantity {selectedSemiFinishedProduct && (
                                        <span className="text-muted-foreground">({semiFinishedProducts.find(m => m._id === selectedSemiFinishedProduct)?.uom})</span>
                                    )}</Label>
                                                <Input
                                                    type="number"
                                                    placeholder={
                                                        selectedSemiFinishedProduct
                                                            ? `Enter quantity in ${semiFinishedProducts.find(m => m._id === selectedSemiFinishedProduct)?.uom}`
                                                            : "Enter quantity"
                                                    }
                                                    value={selectedSemiFinishedProductQuantity}
                                                    onChange={(e) => setSelectedSemiFinishedProductQuantity(Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button type="button" onClick={addSemiFinishedProduct}>
                                                    <Plus className="h-4 w-4 mr-1" /> Add
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Product Name</TableHead>
                                                        <TableHead>Quantity</TableHead>
                                                        <TableHead className="w-[100px]">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {form.watch("semiFinishedComponents")?.map((product) => (
                                                        <TableRow key={product.productId}>
                                                            <TableCell>{product.productName}</TableCell>
                                                            <TableCell>{product.quantity}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeSemiFinishedProduct(product.productId)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {(!form.watch("semiFinishedComponents") || form.watch("semiFinishedComponents")?.length === 0) && (
                                                        <TableRow>
                                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                                No semi-finished components added
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Resources Tab */}
                        <TabsContent value="resources">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Machines */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Wrench className="h-5 w-5 text-primary" />
                                            Machines
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Selected Machines</Label>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Machine</TableHead>
                                                        <TableHead>Cycle Time (mins)</TableHead>
                                                        <TableHead>Products per Cycle {form.watch("uom") && <span className="text-muted-foreground"> ({form.watch("uom")})</span>} </TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {form.watch("machines")?.map((machine) => (
                                                        <TableRow key={machine.machineId}>
                                                            <TableCell>{machine.machineName}</TableCell>
                                                            <TableCell>{machine.cycleTime}</TableCell>
                                                            <TableCell>{machine.productsProducedInOneCycleTime}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeMachine(machine.machineId)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Machine selection */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Select Machine</Label>
                                                <Select
                                                    value={selectedMachine}
                                                    onValueChange={setSelectedMachine}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a machine" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {machines.map((machine) => (
                                                            <SelectItem key={machine._id} value={machine._id}>
                                                                {machine.machineName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Cycle Time (mins)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={selectedMachineCycleTime}
                                                    onChange={(e) => setSelectedMachineCycleTime(Number(e.target.value))}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Products per Cycle {form.watch("uom") && <span className="text-muted-foreground"> ({form.watch("uom")})</span>} </Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={selectedMachineProductsPerCycle}
                                                    onChange={(e) => setSelectedMachineProductsPerCycle(Number(e.target.value))}
                                                />
                                            </div>
                                        </div>

                                        <Button type="button" onClick={addMachine}>
                                            <Plus className="h-4 w-4 mr-1" /> Add Machine
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Manual Jobs */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-primary" />
                                            Manual Jobs
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Label>Select Manual Job</Label>
                                                <Select
                                                    value={selectedManualJob}
                                                    onValueChange={setSelectedManualJob}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a manual job" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {manualJobs.map((job) => (
                                                            <SelectItem key={job._id} value={job._id}>
                                                                {job.jobName} ({job.department} - {job.jobType})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-32">
                                                <Label>Time (min)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={selectedManualJobTime}
                                                    onChange={(e) => setSelectedManualJobTime(Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button type="button" onClick={addManualJob}>
                                                    <Plus className="h-4 w-4 mr-1" /> Add
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Job Name</TableHead>
                                                        <TableHead>Time (min)</TableHead>
                                                        <TableHead className="w-[100px]">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {form.watch("manualJobs")?.map((job) => (
                                                        <TableRow key={job.jobId}>
                                                            <TableCell>{job.jobName}</TableCell>
                                                            <TableCell>{job.expectedTimePerUnit}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeManualJob(job.jobId)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {(!form.watch("manualJobs") || form.watch("manualJobs")?.length === 0) && (
                                                        <TableRow>
                                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                                No manual jobs added
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end">
                        <Button type="submit" className="flex items-center gap-2">
                            <Save className="h-4 w-4" /> Create Semi-Finished Product
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
