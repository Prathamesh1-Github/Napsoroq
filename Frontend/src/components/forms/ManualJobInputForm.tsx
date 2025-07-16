import { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ArrowLeft, 
    Save,
    Package,
    Building2,
    Wrench,
    DollarSign,
    AlertCircle,
    ClipboardList,
    Users,
    Shield,
    Timer,
    FileText,
    ArrowRight,
    X
} from "lucide-react";

const manualJobSchema = z.object({
    jobName: z.string().min(1, "Job name is required"),
    department: z.string().min(1, "Department is required"),
    jobType: z.enum(['Process', 'Quality Check', 'Packaging', 'Other']),
    manualJobCategory: z.enum(['Assembly', 'Finishing', 'Surface Treatment', 'QC', 'Packaging', 'Logistics', 'Other']),
    jobDescription: z.string().optional(),
    estimatedDuration: z.number().min(0, "Estimated duration must be positive"),
    scrapReasonSamples: z.array(z.string()),
    toolRequirement: z.array(z.string()),
    minimumWorkersRequired: z.number().min(1, "Minimum workers required must be at least 1"),
    qualityCheckParameters: z.array(z.string()),
    qualityCheckFrequency: z.enum(['Per Unit', 'Per Batch', 'Per Shift', 'Daily']),
    costType: z.enum(['Fixed', 'Per Unit', 'Hourly']),
    costPerUnit: z.number().optional(),
    hourlyCostRate: z.number().optional(),
    fixedCostPerDay: z.number().optional(),
});

type ManualJobForm = z.infer<typeof manualJobSchema> & {
    requiresRawMaterials?: boolean;
    rawMaterials?: { rawMaterialId: string; rawMaterialName: string }[];
};
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

const fieldGroups = {
    basicInfo: [
        { label: "Job Name", key: "jobName", type: "text", icon: Package },
        { label: "Department", key: "department", type: "text", icon: Building2 },
        { label: "Job Type", key: "jobType", type: "select", icon: ClipboardList, options: ['Process', 'Quality Check', 'Packaging', 'Other'] },
        { label: "Job Category", key: "manualJobCategory", type: "select", icon: Wrench, options: ['Assembly', 'Finishing', 'Surface Treatment', 'QC', 'Packaging', 'Logistics', 'Other'] },
        { label: "Job Description", key: "jobDescription", type: "textarea", icon: FileText },
    ],
    resourceRequirements: [
        { label: "Estimated Duration (minutes)", key: "estimatedDuration", type: "number", icon: Timer },
        { label: "Minimum Workers Required", key: "minimumWorkersRequired", type: "number", icon: Users },
        { label: "Tool Requirements", key: "toolRequirement", type: "multiselect", icon: Wrench },
    ],
    qualityControl: [
        { label: "Quality Check Parameters", key: "qualityCheckParameters", type: "multiselect", icon: Shield },
        { label: "Quality Check Frequency", key: "qualityCheckFrequency", type: "select", icon: Shield, options: ['Per Unit', 'Per Batch', 'Per Shift', 'Daily'] },
        { label: "Scrap Reason Samples", key: "scrapReasonSamples", type: "multiselect", icon: AlertCircle },
    ],
    costing: [
        { label: "Cost Type", key: "costType", type: "select", icon: DollarSign, options: ['Fixed', 'Per Unit', 'Hourly'] },
    ]
};

export function ManualJobInputForm() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [errors, setErrors] = useState<ValidationError>({});
    const [activeTab, setActiveTab] = useState("basicInfo");
    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
    const [loadingRawMaterials, setLoadingRawMaterials] = useState(false);
    const [formData, setFormData] = useState<ManualJobForm>({
        jobName: "",
        department: "",
        jobType: "Process",
        manualJobCategory: "Assembly",
        jobDescription: "",
        estimatedDuration: 0,
        scrapReasonSamples: [],
        toolRequirement: [],
        minimumWorkersRequired: 1,
        qualityCheckParameters: [],
        qualityCheckFrequency: "Per Batch",
        costType: "Fixed",
        costPerUnit: 0,
        hourlyCostRate: 0,
        fixedCostPerDay: 0,
        requiresRawMaterials: false,
        rawMaterials: []
    });

    useEffect(() => {
        const fetchRawMaterials = async () => {
            try {
                setLoadingRawMaterials(true);
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
                setLoadingRawMaterials(false);
            }
        };

        fetchRawMaterials();
    }, [toast]);

    const validateField = (field: keyof ManualJobForm, value: any) => {
        if (manualJobSchema.shape.hasOwnProperty(field)) {
            try {
                const schema = manualJobSchema.shape[field as keyof typeof manualJobSchema.shape];
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
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, key: keyof ManualJobForm) => {
        const { value, type } = e.target;
        const updatedValue = type === "number" ? Number(value) : value;
        setFormData(prev => ({ ...prev, [key]: updatedValue }));
        validateField(key, updatedValue);
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({ 
            ...prev,
            requiresRawMaterials: checked,
            rawMaterials: checked ? prev.rawMaterials : []
        }));
    };

    const addRawMaterial = (materialId: string) => {
        const material = rawMaterials.find((m: RawMaterial) => m._id === materialId);
        if (material && !formData.rawMaterials!.some((rm: {rawMaterialId: string}) => rm.rawMaterialId === materialId)) {
            setFormData(prev => ({
                ...prev,
                rawMaterials: [
                    ...prev.rawMaterials!,
                    {
                        rawMaterialId: material._id,
                        rawMaterialName: material.rawMaterialName
                    }
                ]
            }));
        }
    };

    const removeRawMaterial = (materialId: string) => {
        setFormData(prev => ({
                ...prev,
            rawMaterials: prev.rawMaterials!.filter((rm: {rawMaterialId: string}) => rm.rawMaterialId !== materialId)
            }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Validate the entire form before submission
            const validationResult = manualJobSchema.safeParse(formData);
            if (!validationResult.success) {
                const newErrors: ValidationError = {};
                validationResult.error.errors.forEach(error => {
                    const path = error.path[0] as string;
                    if (!newErrors[path]) {
                        newErrors[path] = [];
                    }
                    newErrors[path].push(error.message);
                });
                setErrors(newErrors);
                toast({
                    title: "Validation Error",
                    description: "Please fix the errors in the form",
                    variant: "destructive",
                });
                return;
            }

            // Make API call to create manual job
            const response = await axios.post("https://neura-ops.onrender.com/api/v1/manualjob", formData,
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            
            if (response.status === 201 || response.status === 200) {
                toast({
                    title: "Success",
                    description: "Manual job created successfully",
                });
                navigate("/manual-jobs");
            } else {
                throw new Error("Failed to create manual job");
            }
        } catch (error) {
            console.error("Error creating manual job:", error);
            toast({
                title: "Error",
                description: "Failed to create manual job. Please try again.",
                variant: "destructive",
            });
        }
    };

    const renderError = (field: keyof ManualJobForm) => {
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

    const renderField = ({ label, key, type, icon: Icon, options }: any) => {
        const error = errors[key as keyof ManualJobForm];

        if (type === "select") {
            return (
                <div key={key} className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        {label}
                    </Label>
                    <select
                        value={formData[key as keyof ManualJobForm] as string}
                        onChange={(e) => handleInputChange(e as any, key as keyof ManualJobForm)}
                        className={`w-full p-2 border rounded-md ${error ? "border-destructive" : ""}`}
                    >
                        {options.map((option: string) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {renderError(key as keyof ManualJobForm)}
                </div>
            );
        }

        if (type === "multiselect") {
            return (
                <div key={key} className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        {label}
                    </Label>
                    <Input
                        type="text"
                        placeholder="Enter values (comma-separated)"
                        value={Array.isArray(formData[key as keyof ManualJobForm]) 
                            ? (formData[key as keyof ManualJobForm] as string[]).join(", ")
                            : ""}
                        onChange={(e) => {
                            const values = e.target.value.split(",").map(v => v.trim()).filter(Boolean);
                            setFormData(prev => ({ ...prev, [key]: values }));
                            validateField(key as keyof ManualJobForm, values);
                        }}
                        className={error ? "border-destructive" : ""}
                    />
                    {renderError(key as keyof ManualJobForm)}
                </div>
            );
        }

        if (type === "textarea") {
            return (
                <div key={key} className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        {label}
                    </Label>
                    <textarea
                        value={formData[key as keyof ManualJobForm] as string}
                        onChange={(e) => handleInputChange(e as any, key as keyof ManualJobForm)}
                        className={`w-full p-2 border rounded-md min-h-[100px] ${error ? "border-destructive" : ""}`}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                    />
                    {renderError(key as keyof ManualJobForm)}
                </div>
            );
        }

        return (
            <div key={key} className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                </Label>
                <Input
                    type={type}
                    value={formData[key as keyof ManualJobForm] as string | number}
                    onChange={(e) => handleInputChange(e, key as keyof ManualJobForm)}
                    className={error ? "border-destructive" : ""}
                />
                {renderError(key as keyof ManualJobForm)}
            </div>
        );
    };

    const renderCostFields = () => {
        const costType = formData.costType;
        
        return (
            <div className="space-y-4">
                {costType === "Per Unit" && (
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            Cost Per Unit
                        </Label>
                        <Input
                            type="number"
                            value={formData.costPerUnit}
                            onChange={(e) => handleInputChange(e, "costPerUnit")}
                            className={errors.costPerUnit ? "border-destructive" : ""}
                        />
                        {renderError("costPerUnit")}
                    </div>
                )}
                
                {costType === "Hourly" && (
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            Hourly Cost Rate
                        </Label>
                        <Input
                            type="number"
                            value={formData.hourlyCostRate}
                            onChange={(e) => handleInputChange(e, "hourlyCostRate")}
                            className={errors.hourlyCostRate ? "border-destructive" : ""}
                        />
                        {renderError("hourlyCostRate")}
                    </div>
                )}
                
                {costType === "Fixed" && (
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            Fixed Cost Per Day
                        </Label>
                        <Input
                            type="number"
                            value={formData.fixedCostPerDay}
                            onChange={(e) => handleInputChange(e, "fixedCostPerDay")}
                            className={errors.fixedCostPerDay ? "border-destructive" : ""}
                        />
                        {renderError("fixedCostPerDay")}
                    </div>
                )}
            </div>
        );
    };

    const renderRawMaterialsSection = () => {
        return (
            <div className="space-y-4 mt-6">
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="requiresRawMaterials" 
                        checked={formData.requiresRawMaterials}
                        onCheckedChange={handleCheckboxChange}
                    />
                    <Label htmlFor="requiresRawMaterials" className="text-sm font-medium">
                        This job requires raw materials
                    </Label>
                </div>

                {formData.requiresRawMaterials && (
                    <div className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">Selected Raw Materials</h3>
                            <div className="relative">
                                <select
                                    className="w-full p-2 border rounded-md"
                                    onChange={(e) => addRawMaterial(e.target.value)}
                                    value=""
                                >
                                    <option value="" disabled>Add a raw material...</option>
                                    {rawMaterials
                                        .filter((m: RawMaterial) => !formData.rawMaterials!.some((rm: {rawMaterialId: string}) => rm.rawMaterialId === m._id))
                                        .map((material: RawMaterial) => (
                                            <option key={material._id} value={material._id}>
                                                {material.rawMaterialName} ({material.purchaseUOM})
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>

                        {loadingRawMaterials ? (
                            <div className="flex justify-center py-4">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            </div>
                        ) : formData.rawMaterials!.length > 0 ? (
                            <div className="border rounded-md overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">Material Name</th>
                                            <th className="px-4 py-2 text-right font-medium w-[100px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.rawMaterials!.map((material: {rawMaterialId: string, rawMaterialName: string}) => (
                                            <tr key={material.rawMaterialId} className="border-t">
                                                <td className="px-4 py-2">{material.rawMaterialName}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeRawMaterial(material.rawMaterialId)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted-foreground">
                                No raw materials selected. Use the dropdown above to add materials.
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const tabNames = Object.keys(fieldGroups);
    const currentTabIndex = tabNames.indexOf(activeTab);
    const isLastTab = currentTabIndex === tabNames.length - 1;

    const handleNextTab = () => {
        if (currentTabIndex < tabNames.length - 1) {
            setActiveTab(tabNames[currentTabIndex + 1]);
        }
    };

    return (
        <div className="space-y-6 w-screen p-6 mx-auto">
            <div className="flex items-center justify-between bg-background p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <Package className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Create Manual Job</h1>
                </div>
                <Button variant="outline" onClick={() => navigate("/")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
                        {tabNames.map((tabName) => (
                            <TabsTrigger 
                                key={tabName} 
                                value={tabName}
                                className="capitalize"
                            >
                                {tabName.replace(/([A-Z])/g, ' $1').trim()}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {tabNames.map((tabName) => (
                        <TabsContent key={tabName} value={tabName}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="capitalize">{tabName.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                    {fieldGroups[tabName as keyof typeof fieldGroups].map((field) => renderField(field))}
                                    
                                    {tabName === "costing" && renderCostFields()}
                                    
                                    {tabName === "inputDetails" && renderRawMaterialsSection()}
                                </CardContent>
                                <CardFooter className="flex justify-end gap-4 p-6">
                                    {isLastTab ? (
                                        <Button type="submit" className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            Save Manual Job
                                        </Button>
                                    ) : (
                                        <Button 
                                            type="button" 
                                            onClick={handleNextTab}
                                            className="flex items-center gap-2"
                                        >
                                            Next
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </form>
        </div>
    );
}
