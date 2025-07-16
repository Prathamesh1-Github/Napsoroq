import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, Trash2, DollarSign } from 'lucide-react';

interface CustomCost {
    label: string;
    cost: number;
}

interface ProductForm {
    productId: string;
    productName: string;
    productCategory: string;
    productSKU: string;
    uom: string;
    productVariant: string;
    sellingPrice: number;
    batchSize: number;
    productWeight: number;
    totalMaterialCost: number;
    laborCost: number;
    machineCost: number;
    overheadCost: number;
    customCosts: CustomCost[];
    totalProductionCost: number;
    profitMargin: number;
    finalSellingPrice: number;
    currentStock: number;
    minimumStockLevel: number;
    reorderPoint: number;
    leadTime: number;
    qualityCheckRequired: boolean;
    inspectionCriteria: string;
    defectTolerance: number;
    rawMaterials: { rawMaterialId: string; quantity: number }[];
    machines: {
        machineId: string;
        cycleTime: number;
        productsProducedInOneCycleTime: number;
    }[];
    cycleTime: number;
    manualJobs: { jobId: string; expectedTimePerUnit: number }[];
    semiFinishedComponents: { productId: string; quantity: number }[];
}

const fieldGroups = {
    productDetails: [
        { label: "Product ID", key: "productId", type: "string" },
        { label: "Product Name", key: "productName", type: "string" },
        { label: "Product Category", key: "productCategory", type: "string" },
        { label: "Product SKU", key: "productSKU", type: "string" },
        { label: "Product UOM", key: "uom", type: "string" },
        { label: "Product Variant", key: "productVariant", type: "string" },
        { label: "Selling Price (₹)", key: "sellingPrice", type: "number" },
        { label: "Production Batch Size", key: "batchSize", type: "number" },
        { label: "Product Weight (grams/Kg)", key: "productWeight", type: "number" }
    ],
    costingDetails: [
        { label: "Total Material Cost (₹)", key: "totalMaterialCost", type: "number" },
        { label: "Labor Cost per Unit (₹)", key: "laborCost", type: "number" },
        { label: "Machine Cost per Unit (₹)", key: "machineCost", type: "number" },
        { label: "Overhead Cost per Unit (₹)", key: "overheadCost", type: "number" },
        { label: "Total Production Cost (₹)", key: "totalProductionCost", type: "number" },
        { label: "Profit Margin (%)", key: "profitMargin", type: "number" },
        { label: "Final Selling Price per Unit (₹)", key: "finalSellingPrice", type: "number" }
    ],
    inventoryDetails: [
        { label: "Current Stock Available", key: "currentStock", type: "number" },
        { label: "Minimum Stock Level", key: "minimumStockLevel", type: "number" },
        { label: "Reorder Point", key: "reorderPoint", type: "number" },
        { label: "Lead Time (Days)", key: "leadTime", type: "number" }
    ],
    qualityControl: [
        { label: "Quality Check Required?", key: "qualityCheckRequired", type: "boolean" },
        { label: "Inspection Criteria", key: "inspectionCriteria", type: "string" },
        { label: "Defect Tolerance (%)", key: "defectTolerance", type: "number" }
    ]
};

export function ProductDetailsInputForm() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [formData, setFormData] = useState<ProductForm>({
        productId: '',
        productName: '',
        productCategory: '',
        productSKU: '',
        uom: '',
        productVariant: '',
        sellingPrice: 0,
        batchSize: 0,
        productWeight: 0,
        totalMaterialCost: 0,
        laborCost: 0,
        machineCost: 0,
        overheadCost: 0,
        customCosts: [],
        totalProductionCost: 0,
        profitMargin: 0,
        finalSellingPrice: 0,
        currentStock: 0,
        minimumStockLevel: 0,
        reorderPoint: 0,
        leadTime: 0,
        qualityCheckRequired: false,
        inspectionCriteria: '',
        defectTolerance: 0,
        rawMaterials: [],
        machines: [],
        cycleTime: 0,
        manualJobs: [],
        semiFinishedComponents: [],
    });

    const [rawMaterials, setRawMaterials] = useState<any[]>([]);
    const [machines, setMachines] = useState<any[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState<string>('');
    const [materialQuantity, setMaterialQuantity] = useState<number>(1);

    const [selectedMachine, setSelectedMachine] = useState<string>('');
    const [machineCycleTime, setMachineCycleTime] = useState<number>(0);
    const [productsProducedInOneCycleTime, setProductsProducedInOneCycleTime] = useState<number>(1);

    const [manualJobs, setManualJobs] = useState<any[]>([]);
    const [selectedManualJob, setSelectedManualJob] = useState('');
    const [manualTimePerUnit, setManualTimePerUnit] = useState(0);
    // const [workflowSteps, setWorkflowSteps] = useState<any[]>([]);

    const [semiFinishedProducts, setSemiFinishedProducts] = useState<any[]>([]);
    const [selectedSemiFinishedProduct, setSelectedSemiFinishedProduct] = useState<string>('');
    const [selectedSemiFinishedProductQuantity, setSelectedSemiFinishedProductQuantity] = useState<number>(1);

    // Custom costs state
    const [customCostLabel, setCustomCostLabel] = useState<string>('');
    const [customCostAmount, setCustomCostAmount] = useState<number>(0);

    useEffect(() => {
        async function fetchData() {
            try {
                const [rawRes, machineRes, manualRes, semiFinishedRes] = await Promise.all([
                    axios.get('https://neura-ops.onrender.com/api/v1/rawmaterial', {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem('token'),
                        },
                    }),
                    axios.get('https://neura-ops.onrender.com/api/v1/machine', {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem('token'),
                        },
                    }),
                    axios.get('https://neura-ops.onrender.com/api/v1/manualjob', {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem('token'),
                        },
                    }),
                    axios.get('https://neura-ops.onrender.com/api/v1/semifinished', {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem('token'),
                        },
                    })
                ]);
                setRawMaterials(rawRes.data.rawMaterials);
                setMachines(machineRes.data.machines);
                setManualJobs(manualRes.data.jobs);
                setSemiFinishedProducts(semiFinishedRes.data.products);
            } catch (error) {
                toast({ title: "Error fetching data", description: "Could not load data", variant: "destructive" });
            }
        }
        fetchData();
    }, [toast]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, key: keyof ProductForm) => {
        const { value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [key]: type === "number" ? (value ? Number(value) : 0) : value
        }));
    };

    const handleMaterialChange = () => {
        if (!selectedMaterial) return;
        setFormData((prev) => ({
            ...prev,
            rawMaterials: [...prev.rawMaterials, { rawMaterialId: selectedMaterial, quantity: materialQuantity ?? 1 }]
        }));
        setSelectedMaterial('');
        setMaterialQuantity(1);
    };

    const handleMachineChange = () => {
        if (!selectedMachine) return;
        setFormData((prev) => ({
            ...prev,
            machines: [...prev.machines, {
                machineId: selectedMachine,
                cycleTime: machineCycleTime,
                productsProducedInOneCycleTime: productsProducedInOneCycleTime ?? 1
            }]
        }));
        setSelectedMachine('');
        setMachineCycleTime(0);
        setProductsProducedInOneCycleTime(1);
    };

    const handleAddManualJob = () => {
        if (!selectedManualJob) return;
        setFormData((prev) => ({
            ...prev,
            manualJobs: [...(prev.manualJobs || []), {
                jobId: selectedManualJob,
                expectedTimePerUnit: manualTimePerUnit
            }]
        }));
        setSelectedManualJob('');
        setManualTimePerUnit(0);
    };

    // const handleAddToWorkflow = (type: 'machine' | 'manual', refId: string, stepName: string) => {
    //     setWorkflowSteps(prev => [...prev, {
    //         type,
    //         refId,
    //         stepName,
    //         order: prev.length + 1
    //     }]);
    // };

    const handleSemiFinishedProductChange = () => {
        if (!selectedSemiFinishedProduct) return;
        setFormData((prev) => ({
            ...prev,
            semiFinishedComponents: [...(prev.semiFinishedComponents || []), {
                productId: selectedSemiFinishedProduct,
                quantity: selectedSemiFinishedProductQuantity ?? 1
            }]
        }));
        setSelectedSemiFinishedProduct('');
        setSelectedSemiFinishedProductQuantity(1);
    };

    const removeSemiFinishedProduct = (productId: string) => {
        setFormData((prev) => ({
            ...prev,
            semiFinishedComponents: prev.semiFinishedComponents.filter(
                (component) => component.productId !== productId
            )
        }));
    };

    // Custom costs handlers
    const handleAddCustomCost = () => {
        if (!customCostLabel.trim() || customCostAmount <= 0) {
            toast({
                title: "Invalid Input",
                description: "Please enter a valid cost label and amount",
                variant: "destructive"
            });
            return;
        }

        setFormData((prev) => ({
            ...prev,
            customCosts: [...prev.customCosts, {
                label: customCostLabel.trim(),
                cost: customCostAmount
            }]
        }));
        setCustomCostLabel('');
        setCustomCostAmount(0);
    };

    const removeCustomCost = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            customCosts: prev.customCosts.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const fullForm = {
                ...formData,
                // productionWorkflow: workflowSteps
            };
            await axios.post('https://neura-ops.onrender.com/api/v1/product', fullForm, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token'),
                },
            });
            toast({ title: "Product saved successfully", description: "Product data has been stored." });
            navigate('/');
        } catch (error) {
            toast({ title: "Error saving product", description: "Please try again.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6 w-screen">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Product Details Entry</h1>
                <Button variant="outline" onClick={() => navigate('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>
            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="productDetails" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-8">
                        {Object.keys(fieldGroups).map(tabKey => (
                            <TabsTrigger key={tabKey} value={tabKey}>
                                {tabKey.replace(/([A-Z])/g, ' $1').trim()}
                            </TabsTrigger>
                        ))}
                        <TabsTrigger value="customCosts">Custom Costs</TabsTrigger>
                        <TabsTrigger value="rawMaterials">Raw Materials</TabsTrigger>
                        <TabsTrigger value="production">Production</TabsTrigger>
                        <TabsTrigger value="manualJobs">Manual Jobs</TabsTrigger>
                        <TabsTrigger value="semiFinished">Semi-Finished Components</TabsTrigger>
                    </TabsList>

                    {Object.entries(fieldGroups).map(([tabKey, fields]) => (
                        <TabsContent key={tabKey} value={tabKey}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{tabKey.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    {fields.map(({ label, key, type }) => {
                                        const fieldValue = formData[key as keyof ProductForm];
                                        if (typeof fieldValue !== "string" && typeof fieldValue !== "number") return null;
                                        return (
                                            <div key={key}>
                                                <Label>
                                                    {label}
                                                    {tabKey === "inventoryDetails" && key !== "leadTime" && formData.uom && (
                                                        <span className="text-muted-foreground"> ({formData.uom})</span>
                                                    )}
                                                </Label>
                                                <Input
                                                    type={type}
                                                    value={fieldValue}
                                                    onChange={(e) => handleInputChange(e, key as keyof ProductForm)}
                                                />
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}

                    {/* Custom Costs Tab */}
                    <TabsContent value="customCosts">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Custom Costs
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Display existing custom costs */}
                                {formData.customCosts.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Added Custom Costs</h3>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="p-3 text-left font-medium">Cost Label</th>
                                                        <th className="p-3 text-left font-medium">Amount (₹)</th>
                                                        <th className="p-3 text-left font-medium">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {formData.customCosts.map((cost, index) => (
                                                        <tr key={index} className="border-t">
                                                            <td className="p-3">{cost.label}</td>
                                                            <td className="p-3">₹{cost.cost.toFixed(2)}</td>
                                                            <td className="p-3">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeCustomCost(index)}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">Total Custom Costs:</span>
                                                <span className="text-lg font-bold">
                                                    ₹{formData.customCosts.reduce((sum, cost) => sum + cost.cost, 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Add new custom cost */}
                                <div className="space-y-4 p-4 border rounded-lg bg-card">
                                    <h3 className="text-lg font-semibold">Add New Custom Cost</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="customCostLabel">Cost Label</Label>
                                            <Input
                                                id="customCostLabel"
                                                type="text"
                                                placeholder="e.g., Packaging, Transportation, etc."
                                                value={customCostLabel}
                                                onChange={(e) => setCustomCostLabel(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="customCostAmount">Amount (₹)</Label>
                                            <Input
                                                id="customCostAmount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={customCostAmount}
                                                onChange={(e) => setCustomCostAmount(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        type="button" 
                                        onClick={handleAddCustomCost}
                                        className="w-full"
                                        disabled={!customCostLabel.trim() || customCostAmount <= 0}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Custom Cost
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="rawMaterials">
                        <Card>
                            <CardHeader><CardTitle>Raw Materials Required</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {/* Display added raw materials */}
                                {formData.rawMaterials.length > 0 && (
                                    <div className="mb-4 p-4 border rounded-lg ">
                                        <h2 className="text-lg font-semibold mb-2">Added Raw Materials</h2>
                                        <ul className="space-y-2">
                                            {formData.rawMaterials.map((material, index) => {
                                                const materialDetails = rawMaterials.find(m => m.rawMaterialCode === material.rawMaterialId);
                                                return (
                                                    <li key={index} className="flex justify-between items-center p-2 rounded shadow">
                                                        <span>{materialDetails ? materialDetails.rawMaterialName : "Unknown Material"} - {material.quantity} {materialDetails ? materialDetails.purchaseUOM : "Units"}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {/* Raw material selection and quantity input */}
                                <Label>Select Raw Material</Label>
                                <Select onValueChange={setSelectedMaterial}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a raw material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rawMaterials.map(material => (
                                            <SelectItem key={material.rawMaterialCode} value={material.rawMaterialCode}>
                                                {material.rawMaterialName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Label>
                                    Quantity {selectedMaterial && (
                                        <span className="text-muted-foreground">({rawMaterials.find(m => m.rawMaterialCode === selectedMaterial)?.purchaseUOM})</span>
                                    )}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={materialQuantity}
                                        onChange={(e) => setMaterialQuantity(Number(e.target.value))}
                                        placeholder={
                                            selectedMaterial
                                                ? `Enter quantity in ${rawMaterials.find(m => m.rawMaterialCode === selectedMaterial)?.purchaseUOM}`
                                                : "Enter quantity"
                                        }
                                        className="w-full"
                                    />
                                </div>

                                <Button type='button' onClick={handleMaterialChange}>Add Material</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="production">
                        <Card>
                            <CardHeader><CardTitle>Production Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">

                                {/* Display added machines */}
                                {formData.machines && formData.machines.length > 0 && (
                                    <div className="mb-4 p-4 border rounded-lg">
                                        <h2 className="text-lg font-semibold mb-2">Selected Machines</h2>
                                        <ul className="space-y-2">
                                            {formData.machines.map((machine, index) => {
                                                const machineDetails = machines.find(m => m.machineId === machine.machineId);
                                                return (
                                                    <li key={index} className="flex justify-between items-center p-2 rounded shadow">
                                                        <span>
                                                            {machineDetails ? machineDetails.machineName : "Unknown Machine"} -
                                                            Cycle Time: {machine.cycleTime} mins,
                                                            Products per Cycle: {machine.productsProducedInOneCycleTime}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {/* Machine selection dropdown */}
                                <Label>Select Machine</Label>
                                <Select onValueChange={(value) => setSelectedMachine(value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a machine" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {machines.map(machine => (
                                            <SelectItem key={machine.machineId} value={machine.machineId}>
                                                {machine.machineName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Cycle time input */}
                                <Label>Cycle Time (mins)</Label>
                                <Input
                                    type="number"
                                    value={machineCycleTime}
                                    onChange={(e) => setMachineCycleTime(Number(e.target.value))}
                                />

                                <Label>
                                    Products Produced in One Cycle{" "}
                                    {formData.uom && (
                                        <span className="text-muted-foreground">({formData.uom})</span>
                                    )}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={productsProducedInOneCycleTime}
                                        onChange={(e) => setProductsProducedInOneCycleTime(Number(e.target.value))}
                                        placeholder={
                                            formData.uom
                                                ? `Enter quantity in ${formData.uom}`
                                                : "Enter quantity"
                                        }
                                        className="w-full"
                                    />
                                </div>

                                {/* Button to add machine */}
                                <Button type="button" onClick={handleMachineChange}>Add Machine</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="manualJobs">
                        <Card>
                            <CardHeader><CardTitle>Assign Manual Jobs</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Select onValueChange={setSelectedManualJob}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a manual job" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {manualJobs.map(job => (
                                            <SelectItem key={job._id} value={job._id}>{job.jobName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Label>Expected Time Per {formData.uom && (
                                    <span>{formData.uom}</span>
                                )} (mins)</Label>
                                <Input type="number" value={manualTimePerUnit} onChange={e => setManualTimePerUnit(Number(e.target.value))} />
                                <Button type="button" onClick={handleAddManualJob}>Add Manual Job</Button>

                                {/* Display added manual jobs */}
                                {formData.manualJobs && formData.manualJobs.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-bold mb-2">Selected Manual Jobs:</h4>
                                        <ul className="space-y-2">
                                            {formData.manualJobs.map((job, index) => {
                                                const jobDetails = manualJobs.find(j => j._id === job.jobId);
                                                return (
                                                    <li key={index} className="flex justify-between items-center p-2 border rounded">
                                                        <span>{jobDetails ? jobDetails.jobName : 'Unknown Job'} - {job.expectedTimePerUnit} mins</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="semiFinished">
                        <Card>
                            <CardHeader>
                                <CardTitle>Semi-Finished Components</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
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
                                        <div className="space-y-2">
                                            <Label>
                                                Quantity{" "}
                                                {selectedSemiFinishedProduct && (
                                                    <span className="text-muted-foreground">
                                                        (
                                                        {
                                                            semiFinishedProducts.find(p => p._id === selectedSemiFinishedProduct)
                                                                ?.uom || "Units"
                                                        }
                                                        )
                                                    </span>
                                                )}
                                            </Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={selectedSemiFinishedProductQuantity}
                                                onChange={(e) =>
                                                    setSelectedSemiFinishedProductQuantity(Number(e.target.value))
                                                }
                                                placeholder={
                                                    selectedSemiFinishedProduct
                                                        ? `Enter quantity in ${semiFinishedProducts.find(p => p._id === selectedSemiFinishedProduct)
                                                            ?.uom || "units"
                                                        }`
                                                        : "Enter quantity"
                                                }
                                            />
                                        </div>
                                    </div>
                                    <Button type="button" onClick={handleSemiFinishedProductChange}>
                                        Add Component
                                    </Button>

                                    <div className="border rounded-lg">
                                        <table className="w-full">
                                            <thead>
                                                <tr>
                                                    <th className="p-2 text-left">Product</th>
                                                    <th className="p-2 text-left">Quantity</th>
                                                    <th className="p-2 text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.semiFinishedComponents?.map((component) => {
                                                    const product = semiFinishedProducts.find(p => p._id === component.productId);
                                                    return (
                                                        <tr key={component.productId}>
                                                            <td className="p-2">{product?.productName || 'Unknown'}</td>
                                                            <td className="p-2">
                                                                {component.quantity}{" "}
                                                                {semiFinishedProducts.find(p => p._id === component.productId)?.uom || ""}
                                                            </td>
                                                            <td className="p-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeSemiFinishedProduct(component.productId)}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
                <CardFooter className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => navigate('/')}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit}> <Save className="mr-2 h-4 w-4" /> Save Product </Button>
                </CardFooter>
            </form>
        </div>
    );
}

export default ProductDetailsInputForm;