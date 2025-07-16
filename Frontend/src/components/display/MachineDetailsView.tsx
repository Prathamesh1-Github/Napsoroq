import { useEffect, useState } from 'react';
import axios from 'axios';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormData {
    [key: string]: string | number | boolean | null;
}

const sections = {
    generalMachineInfo: "General Machine Information",
    machineSpecifications: "Machine Specifications",
    maintenanceServiceDetails: "Maintenance Service Details",
    machineUtilizationMetrics: "Machine Utilization Details",
    costingFinancialInputs: "Machine Costing Details"
};

const fields = {
    generalMachineInfo: [
        "machineId", "machineName", "machineType", "manufacturer", "modelNumber", "yearOfManufacture", "machineLocation"
    ],
    machineSpecifications: [
        "powerRequirement", "voltagePhase", "operatingPressure", "idealCycleTime", "maxProductionCapacity",
        "availableMachineTime", "chillerRequirement", "compressedAirRequirement", "coolingSystemType"
    ],
    maintenanceServiceDetails: [
        "lastMaintenanceDate", "nextScheduledMaintenanceDate", "maintenanceFrequency", "mtbf", "mttr", "supplierContact"
    ],
    machineUtilizationMetrics: [
        "oee", "machineDowntime", "unplannedDowntime", "predictiveMaintenanceSystem"
    ],
    costingFinancialInputs: [
        "initialMachineCost", "annualMaintenanceCost", "energyConsumptionPerUnit", "totalEnergyCostPerMonth", "materialCostPerUnit"
    ]
};

export function MachineDetailsView() {
    const [data, setData] = useState<FormData[]>([]);
    const [expandedMachine, setExpandedMachine] = useState<number | null>(null);

    useEffect(() => {
        axios.get('https://neura-ops.onrender.com/api/v1/machine',
            {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token'),
                },
            }
        )
            .then(response => setData(response.data.machines))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    if (!data.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-[300px]">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-4">
                            <Settings2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="text-lg font-medium">Loading machines...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-screen items-center justify-between"
            >
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Machine Details
                    </h1>
                    <p className="text-muted-foreground mt-2">View and manage machine metrics</p>
                </div>
                <Link to="/machine-entry">
                    <Button className="shadow-lg hover:shadow-primary/25 transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Add Machine
                    </Button>
                </Link>
            </motion.div>

            <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-6">
                    {data.map((machine, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="overflow-hidden">
                                <CardHeader
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => setExpandedMachine(expandedMachine === index ? null : index)}
                                >
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl flex items-center space-x-3">
                                            <span>Machine {index + 1}: {machine.machineName || "Unnamed Machine"}</span>
                                        </CardTitle>
                                        {expandedMachine === index ?
                                            <ChevronUp className="h-6 w-6 text-muted-foreground" /> :
                                            <ChevronDown className="h-6 w-6 text-muted-foreground" />
                                        }
                                    </div>
                                </CardHeader>

                                <AnimatePresence>
                                    {expandedMachine === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <CardContent className="pt-6">
                                                <Tabs defaultValue="generalMachineInfo" className="space-y-6">
                                                    <TabsList className="grid w-full grid-cols-5 h-auto gap-4 bg-background p-1">
                                                        {Object.entries(sections).map(([key, label]) => (
                                                            <TabsTrigger
                                                                key={key}
                                                                value={key}
                                                                className="data-[state=active]:shadow-lg transition-all duration-300"
                                                            >
                                                                {label}
                                                            </TabsTrigger>
                                                        ))}
                                                    </TabsList>

                                                    {Object.entries(sections).map(([key, title]) => (
                                                        <TabsContent key={key} value={key}>
                                                            <Card>
                                                                <CardHeader>
                                                                    <CardTitle className="text-2xl">{title}</CardTitle>
                                                                </CardHeader>
                                                                <CardContent>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        {fields[key as keyof typeof fields].map((field, idx) => (
                                                                            <div key={idx} className="space-y-2">
                                                                                <Label className="text-sm font-medium text-muted-foreground">
                                                                                    {field.replace(/([A-Z])/g, ' $1').trim()}
                                                                                </Label>
                                                                                <p className="text-lg font-medium p-3 rounded-lg bg-muted/30">
                                                                                    {machine[field] ?? "N/A"}
                                                                                </p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </TabsContent>
                                                    ))}
                                                </Tabs>
                                            </CardContent>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </ScrollArea>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <CardFooter className="flex justify-between mt-6">
                    <Link to="/machine-entry">
                        <Button
                            variant="outline"
                            className="shadow-sm hover:shadow-lg transition-all"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                        </Button>
                    </Link>
                </CardFooter>
            </motion.div>
        </div>
    );
}