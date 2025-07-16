import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, AlertCircle, Wrench, Settings, Gauge, Power, Zap, Timer, Maximize2, Clock, Thermometer, Wind, Snowflake, Calendar, PenTool as Tool, Clock3, Clock4, PhoneCall, BarChart, AlertTriangle, PieChart, DollarSign, Battery, Calculator, Package, FileText, Building2 } from 'lucide-react';

// Zod schema for form validation
const machineSchema = z.object({
    machineId: z.string().min(1, "Machine ID is required"),
    machineName: z.string().min(1, "Machine name is required"),
    machineType: z.string().min(1, "Machine type is required"),
    manufacturer: z.string().min(1, "Manufacturer is required"),
    modelNumber: z.string().min(1, "Model number is required"),
    yearOfManufacture: z.number().min(1900, "Invalid year").nullable(),
    machineLocation: z.string().min(1, "Location is required"),
    powerRequirement: z.number().min(0, "Must be a positive number").nullable(),
    voltagePhase: z.string().min(1, "Voltage/Phase is required"),
    operatingPressure: z.number().min(0, "Must be a positive number").nullable(),
    idealCycleTime: z.number().min(0, "Must be a positive number").nullable(),
    maxProductionCapacity: z.number().min(0, "Must be a positive number").nullable(),
    availableMachineTime: z.number().min(0, "Must be a positive number").nullable(),
    chillerRequirement: z.number().min(0, "Must be a positive number").nullable(),
    compressedAirRequirement: z.number().min(0, "Must be a positive number").nullable(),
    coolingSystemType: z.string().min(1, "Cooling system type is required"),
    lastMaintenanceDate: z.string().min(1, "Last maintenance date is required"),
    nextScheduledMaintenanceDate: z.string().min(1, "Next maintenance date is required"),
    maintenanceFrequency: z.string().min(1, "Maintenance frequency is required"),
    mtbf: z.number().min(0, "Must be a positive number").nullable(),
    mttr: z.number().min(0, "Must be a positive number").nullable(),
    supplierContact: z.string().min(1, "Supplier contact is required"),
    oee: z.number().min(0, "Must be a positive number").max(100, "Cannot exceed 100%").nullable(),
    machineDowntime: z.number().min(0, "Must be a positive number").nullable(),
    unplannedDowntime: z.number().min(0, "Must be a positive number").nullable(),
    predictiveMaintenanceSystem: z.boolean(),
    initialMachineCost: z.number().min(0, "Must be a positive number").nullable(),
    annualMaintenanceCost: z.number().min(0, "Must be a positive number").nullable(),
    energyConsumptionPerUnit: z.number().min(0, "Must be a positive number").nullable(),
    totalEnergyCostPerMonth: z.number().min(0, "Must be a positive number").nullable(),
    materialCostPerUnit: z.number().min(0, "Must be a positive number").nullable(),
    additionalNotes: z.string()
});

type MachineForm = z.infer<typeof machineSchema>;

interface ValidationError {
    [key: string]: string[];
}

const generalMachineInfo = [
    { label: "Machine ID / Code", key: "machineId", type: "text", icon: Wrench, placeholder: "Enter machine ID" },
    { label: "Machine Name", key: "machineName", type: "text", icon: Settings, placeholder: "Enter machine name" },
    { label: "Machine Type", key: "machineType", type: "text", icon: Gauge, placeholder: "Enter machine type" },
    { label: "Manufacturer", key: "manufacturer", type: "text", icon: Building2, placeholder: "Enter manufacturer name" },
    { label: "Model Number", key: "modelNumber", type: "text", icon: FileText, placeholder: "Enter model number" },
    { label: "Year of Manufacture", key: "yearOfManufacture", type: "number", icon: Calendar, placeholder: "Enter manufacture year" },
    { label: "Machine Location", key: "machineLocation", type: "text", icon: Package, placeholder: "Enter machine location" }
];

const machineSpecifications = [
    { label: "Power Requirement (kW)", key: "powerRequirement", type: "number", icon: Power, placeholder: "Enter power requirement" },
    { label: "Voltage & Phase", key: "voltagePhase", type: "text", icon: Zap, placeholder: "Enter voltage and phase" },
    { label: "Operating Pressure (bar/psi)", key: "operatingPressure", type: "number", icon: Gauge, placeholder: "Enter operating pressure" },
    { label: "Ideal Cycle Time (sec/unit)", key: "idealCycleTime", type: "number", icon: Timer, placeholder: "Enter cycle time" },
    { label: "Max Production Capacity", key: "maxProductionCapacity", type: "number", icon: Maximize2, placeholder: "Enter max capacity" },
    { label: "Available Machine Time (hrs/day)", key: "availableMachineTime", type: "number", icon: Clock, placeholder: "Enter available time" },
    { label: "Chiller Requirement (Tons)", key: "chillerRequirement", type: "number", icon: Thermometer, placeholder: "Enter chiller requirement" },
    { label: "Compressed Air (CFM)", key: "compressedAirRequirement", type: "number", icon: Wind, placeholder: "Enter air requirement" },
    { label: "Cooling System Type", key: "coolingSystemType", type: "text", icon: Snowflake, placeholder: "Enter cooling system type" }
];

const maintenanceServiceDetails = [
    { label: "Last Maintenance Date", key: "lastMaintenanceDate", type: "date", icon: Calendar, placeholder: "Select last maintenance date" },
    { label: "Next Scheduled Maintenance", key: "nextScheduledMaintenanceDate", type: "date", icon: Calendar, placeholder: "Select next maintenance date" },
    { label: "Maintenance Frequency", key: "maintenanceFrequency", type: "text", icon: Tool, placeholder: "Enter maintenance frequency" },
    { label: "MTBF (Hours)", key: "mtbf", type: "number", icon: Clock3, placeholder: "Enter MTBF" },
    { label: "MTTR (Hours)", key: "mttr", type: "number", icon: Clock4, placeholder: "Enter MTTR" },
    { label: "Service Provider Contact", key: "supplierContact", type: "text", icon: PhoneCall, placeholder: "Enter service provider contact" }
];

const machineUtilizationMetrics = [
    { label: "OEE (%)", key: "oee", type: "number", icon: BarChart, placeholder: "Enter OEE percentage" },
    { label: "Machine Downtime (hrs/month)", key: "machineDowntime", type: "number", icon: AlertTriangle, placeholder: "Enter downtime" },
    { label: "Unplanned Downtime (hrs/month)", key: "unplannedDowntime", type: "number", icon: PieChart, placeholder: "Enter unplanned downtime" }
];

const costingFinancialInputs = [
    { label: "Initial Machine Cost ($)", key: "initialMachineCost", type: "number", icon: DollarSign, placeholder: "Enter initial cost" },
    { label: "Annual Maintenance Cost ($)", key: "annualMaintenanceCost", type: "number", icon: Tool, placeholder: "Enter maintenance cost" },
    { label: "Energy Consumption (kWh/Unit)", key: "energyConsumptionPerUnit", type: "number", icon: Battery, placeholder: "Enter energy consumption" },
    { label: "Monthly Energy Cost ($)", key: "totalEnergyCostPerMonth", type: "number", icon: Calculator, placeholder: "Enter energy cost" },
    { label: "Material Cost per Unit ($)", key: "materialCostPerUnit", type: "number", icon: Package, placeholder: "Enter material cost" }
];

export function MachineInputForm() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("generalMachineInfo");
    const [errors, setErrors] = useState<ValidationError>({});

    const [formData, setFormData] = useState<MachineForm>({
        machineId: '',
        machineName: '',
        machineType: '',
        manufacturer: '',
        modelNumber: '',
        yearOfManufacture: null,
        machineLocation: '',
        powerRequirement: null,
        voltagePhase: '',
        operatingPressure: null,
        idealCycleTime: null,
        maxProductionCapacity: null,
        availableMachineTime: null,
        chillerRequirement: null,
        compressedAirRequirement: null,
        coolingSystemType: '',
        lastMaintenanceDate: '',
        nextScheduledMaintenanceDate: '',
        maintenanceFrequency: '',
        mtbf: null,
        mttr: null,
        supplierContact: '',
        oee: null,
        machineDowntime: null,
        unplannedDowntime: null,
        predictiveMaintenanceSystem: false,
        initialMachineCost: null,
        annualMaintenanceCost: null,
        energyConsumptionPerUnit: null,
        totalEnergyCostPerMonth: null,
        materialCostPerUnit: null,
        additionalNotes: ''
    });

    const validateField = (field: keyof MachineForm, value: any) => {
        try {
            const schema = machineSchema.shape[field];
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

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, key: keyof MachineForm) => {
        const { value, type } = e.target;
        const newValue = type === "number" ? (value ? Number(value) : null) : value;
        setFormData(prev => ({
            ...prev,
            [key]: newValue
        }));
        validateField(key, newValue);
    };

    const calculateProgress = () => {
        const totalFields = Object.keys(machineSchema.shape).length;
        const filledFields = Object.entries(formData).filter(([, value]) => {
            if (value === null || value === '') return false;
            if (typeof value === 'string' && value.trim() === '') return false;
            return true;
        }).length;
        return (filledFields / totalFields) * 100;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const validatedData = machineSchema.parse(formData);
            await axios.post('https://neura-ops.onrender.com/api/v1/machine', validatedData, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token'),
                },
            });
            toast({
                title: "Success!",
                description: "Machine data has been saved successfully.",
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
                    description: "Failed to save machine data. Please try again.",
                    variant: "destructive"
                });
            }
        }
    };

    const renderError = (field: keyof MachineForm) => {
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

    const renderFields = (fields: any[], showDividers = false) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(({ label, key, type, icon: Icon, placeholder }, index) => (
                <div key={index} className={`space-y-2 ${showDividers && index !== fields.length - 1 ? 'border-b pb-4' : ''}`}>
                    <Label className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="h-4 w-4 text-primary" />
                        {label}
                    </Label>
                    <Input
                        type={type}
                        placeholder={placeholder}
                        value={formData[key as keyof MachineForm] !== null && formData[key as keyof MachineForm] !== undefined
                            ? String(formData[key as keyof MachineForm])
                            : ''}
                        onChange={(e) => handleInputChange(e, key as keyof MachineForm)}
                        className={errors[key as keyof MachineForm] ? 'border-destructive' : ''}
                    />
                    {renderError(key as keyof MachineForm)}
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-screen min-h-screen bg-background/95 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between bg-card p-6 rounded-lg shadow-lg border border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Settings className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Machine Details Entry</h1>
                            <p className="text-muted-foreground">Configure and manage your machine specifications</p>
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
                            <TabsList className="grid w-full grid-cols-4 h-14">
                                <TabsTrigger value="generalMachineInfo" className="data-[state=active]:bg-primary/10">
                                    <Settings className="mr-2 h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-medium">General Info</div>
                                        <span className="text-xs text-muted-foreground">Basic machine details</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger value="machineSpecifications" className="data-[state=active]:bg-primary/10">
                                    <Gauge className="mr-2 h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Specifications</div>
                                        <span className="text-xs text-muted-foreground">Technical details</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger value="maintenanceServiceDetails" className="data-[state=active]:bg-primary/10">
                                    <Tool className="mr-2 h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Maintenance</div>
                                        <span className="text-xs text-muted-foreground">Service information</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger value="costingFinancialInputs" className="data-[state=active]:bg-primary/10">
                                    <DollarSign className="mr-2 h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Costing</div>
                                        <span className="text-xs text-muted-foreground">Financial details</span>
                                    </div>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="generalMachineInfo">
                                <Card>
                                    <CardHeader className="border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="h-5 w-5 text-primary" />
                                            General Machine Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {renderFields(generalMachineInfo)}
                                    </CardContent>
                                    <CardFooter className="border-t p-6">
                                        <Button
                                            type="button"
                                            onClick={() => setActiveTab("machineSpecifications")}
                                            className="ml-auto gap-2"
                                        >
                                            Next: Specifications
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>

                            <TabsContent value="machineSpecifications">
                                <Card>
                                    <CardHeader className="border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <Gauge className="h-5 w-5 text-primary" />
                                            Machine Specifications
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {renderFields(machineSpecifications)}
                                    </CardContent>
                                    <CardFooter className="border-t p-6 flex justify-between">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setActiveTab("generalMachineInfo")}
                                            className="gap-2"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Back to General Info
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => setActiveTab("maintenanceServiceDetails")}
                                            className="gap-2"
                                        >
                                            Next: Maintenance
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>

                            <TabsContent value="maintenanceServiceDetails">
                                <Card>
                                    <CardHeader className="border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <Tool className="h-5 w-5 text-primary" />
                                            Maintenance & Service Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {renderFields(maintenanceServiceDetails)}
                                        {renderFields(machineUtilizationMetrics)}
                                        <div className="mt-6">
                                            <Label className="flex items-center gap-2 text-muted-foreground">
                                                <Settings className="h-4 w-4 text-primary" />
                                                Predictive Maintenance System
                                            </Label>
                                            <Select
                                                value={formData.predictiveMaintenanceSystem ? "yes" : "no"}
                                                onValueChange={(value) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        predictiveMaintenanceSystem: value === "yes"
                                                    }));
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select option" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="yes">Yes</SelectItem>
                                                    <SelectItem value="no">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t p-6 flex justify-between">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setActiveTab("machineSpecifications")}
                                            className="gap-2"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Back to Specifications
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => setActiveTab("costingFinancialInputs")}
                                            className="gap-2"
                                        >
                                            Next: Costing
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>

                            <TabsContent value="costingFinancialInputs">
                                <Card>
                                    <CardHeader className="border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-primary" />
                                            Machine Costing Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {renderFields(costingFinancialInputs)}
                                    </CardContent>
                                    <CardFooter className="border-t p-6 flex justify-between">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setActiveTab("maintenanceServiceDetails")}
                                            className="gap-2"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Back to Maintenance
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="gap-2 bg-primary hover:bg-primary/90"
                                        >
                                            <Save className="h-4 w-4" />
                                            Save Machine Data
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default MachineInputForm;