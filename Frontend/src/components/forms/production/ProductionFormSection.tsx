import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TimeInput } from './TimeInput';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { format } from 'date-fns';
import {
    Factory,
    Save,
    CheckCircle2,
    Timer,
    Clock,
    Box,
    XCircle,
    Hourglass,
    Settings,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface ProductionFormSectionProps {
    selectedDate: Date;
    isCompleted: boolean;
    onDataChange: (data: any) => void;
}

interface MachineData {
    machineId: number;
    machineName: string;
}

const fieldMappings = [
    { label: "Planned Production Time", key: "plannedProductionTime", icon: Timer },
    { label: "Actual Production Time", key: "actualProductionTime", icon: Clock },
    { label: "Total Quantity Produced (Units)", key: "totalUnitsProduced", icon: Box },
    { label: "Good Quantity Produced (Units)", key: "goodUnitsProduced", icon: CheckCircle2 },
    { label: "Good Quantity Without Rework (Units)", key: "goodUnitsWithoutRework", icon: CheckCircle2 },
    { label: "Scrap Quantity (Units)", key: "scrapUnits", icon: XCircle },
    { label: "Ideal Cycle Time (Seconds per Unit)", key: "idealCycleTime", icon: Hourglass },
    { label: "Total Downtime", key: "totalDowntime", icon: Timer },
    { label: "Changeover Time", key: "changeoverTime", icon: Settings },
    { label: "Actual Machine Run Time", key: "actualMachineRunTime", icon: Timer },
];

const isTimeField = (key: string): boolean => {
    const timeFields = [
        'plannedProductionTime',
        'actualProductionTime',
        'totalDowntime',
        'changeoverTime',
        'actualMachineRunTime'
    ];
    return timeFields.includes(key);
};

export function ProductionFormSection({ selectedDate, isCompleted, onDataChange }: ProductionFormSectionProps) {
    const [machines, setMachines] = useState<MachineData[]>([]);
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [expandedMachine, setExpandedMachine] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchMachines();
    }, []);

    const fetchMachines = async () => {
        try {
            const response = await axios.get('https://neura-ops.onrender.com/api/v1/machine', {
                headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
            });

            setMachines(response.data.machines);
            const initialFormData: { [key: string]: any } = {};

            response.data.machines.forEach((machine: MachineData) => {
                const machineKey = String(machine.machineId); // ensure it's a string
                initialFormData[machineKey] = fieldMappings.reduce((acc, field) => ({
                    ...acc,
                    [field.key]: null
                }), {});
                initialFormData[machineKey].machineId = machine.machineId;
            });


            setFormData(initialFormData);
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not load machines. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, machineId: number, key: string) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [machineId]: {
                ...prev[machineId],
                [key]: Number(value) || 0
            }
        }));
    };

    const handleTimeInputChange = (machineId: number, key: string, valueInMinutes: number) => {
        setFormData((prev) => ({
            ...prev,
            [machineId]: {
                ...prev[machineId],
                [key]: valueInMinutes
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Create a specific date for the selected date
            const targetDate = new Date(selectedDate);

            await Promise.all(machines.map(machine => {
                const dataToSave = {
                    ...formData[machine.machineId],
                    // Override the createdAt to be the selected date
                    createdAt: targetDate.toISOString()
                };

                return axios.post('https://neura-ops.onrender.com/api/v1/production/', dataToSave, {
                    headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
                });
            }));

            toast({
                title: "Success!",
                description: `Machine production data has been saved for ${format(selectedDate, 'PPP')}.`,
            });

            onDataChange(formData);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save production data. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Factory className="h-6 w-6 text-blue-600" />
                        <div>
                            <CardTitle className="text-blue-900">Machine Production Data</CardTitle>
                            <p className="text-sm text-blue-700 mt-1">Enter production metrics for all machines</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isCompleted && (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                            </Badge>
                        )}
                        <Button onClick={handleSave} disabled={loading} size="sm">
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="space-y-4">
                    {machines.map((machine, index) => (
                        <motion.div
                            key={machine.machineId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border rounded-lg overflow-hidden"
                        >
                            <div
                                className="p-4 bg-black-50 hover:bg-gray-500 transition-colors cursor-pointer"
                                onClick={() => setExpandedMachine(expandedMachine === index ? null : index)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Factory className="h-5 w-5 text-gray-600" />
                                        <h3 className="font-semibold">{machine.machineName || "Unnamed Machine"}</h3>
                                    </div>
                                    {expandedMachine === index ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {expandedMachine === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t bg-black"
                                >
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {fieldMappings.map(({ label, key, icon: Icon }) => (
                                                <div key={key}>
                                                    {isTimeField(key) ? (
                                                        <TimeInput
                                                            label={label}
                                                            icon={Icon}
                                                            value={formData[machine.machineId]?.[key] ?? null}
                                                            onChange={(valueInMinutes) =>
                                                                handleTimeInputChange(machine.machineId, key, valueInMinutes)
                                                            }
                                                            required={true}
                                                        />
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <Label className="flex items-center gap-2">
                                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                                                {label}
                                                                <span className="text-destructive">*</span>
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                value={formData[machine.machineId]?.[key] ?? ''}
                                                                onChange={(e) => handleInputChange(e, machine.machineId, key)}
                                                                className="transition-all focus:ring-2 focus:ring-primary/20"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}