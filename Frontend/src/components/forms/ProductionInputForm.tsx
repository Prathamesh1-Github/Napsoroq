import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Plus,
    Save,
    Timer,
    Clock,
    Box,
    CheckCircle2,
    XCircle,
    Hourglass,
    Settings,
    ChevronDown,
    ChevronUp,
    Factory
} from 'lucide-react';


interface TimeInputProps {
    label: string;
    value: number | null; // Value in minutes
    onChange: (valueInMinutes: number) => void;
    icon?: React.ElementType;
    required?: boolean;
}

export function TimeInput({
    label,
    value,
    onChange,
    icon: Icon = Clock,
    required = false
}: TimeInputProps) {
    const [hours, setHours] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(0);
    const [seconds, setSeconds] = useState<number>(0);

    // Convert minutes to h:m:s when value changes externally
    useEffect(() => {
        if (value === null) {
            setHours(0);
            setMinutes(0);
            setSeconds(0);
            return;
        }

        const totalMinutes = Math.max(0, value);
        const calculatedHours = Math.floor(totalMinutes / 60);
        const calculatedMinutes = Math.floor(totalMinutes % 60);
        const calculatedSeconds = Math.round((totalMinutes % 1) * 60);

        setHours(calculatedHours);
        setMinutes(calculatedMinutes);
        setSeconds(calculatedSeconds);
    }, [value]);

    // Convert h:m:s to minutes when any input changes
    const handleTimeChange = (
        newHours: number,
        newMinutes: number,
        newSeconds: number
    ) => {
        const totalMinutes =
            newHours * 60 +
            newMinutes +
            newSeconds / 60;

        onChange(totalMinutes);
    };

    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
                {required && <span className="text-destructive">*</span>}
            </Label>

            <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                    <Input
                        type="number"
                        min="0"
                        value={hours || ''}
                        onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            setHours(newValue);
                            handleTimeChange(newValue, minutes, seconds);
                        }}
                        className="pr-8 transition-all focus:ring-2 focus:ring-primary/20"
                        placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        hrs
                    </span>
                </div>

                <div className="relative">
                    <Input
                        type="number"
                        min="0"
                        max="59"
                        value={minutes || ''}
                        onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            setMinutes(newValue);
                            handleTimeChange(hours, newValue, seconds);
                        }}
                        className="pr-8 transition-all focus:ring-2 focus:ring-primary/20"
                        placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        min
                    </span>
                </div>

                <div className="relative">
                    <Input
                        type="number"
                        min="0"
                        max="59"
                        value={seconds || ''}
                        onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            setSeconds(newValue);
                            handleTimeChange(hours, minutes, newValue);
                        }}
                        className="pr-8 transition-all focus:ring-2 focus:ring-primary/20"
                        placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        sec
                    </span>
                </div>
            </div>
        </div>
    );
}

/**
 * Converts hours, minutes, and seconds to total minutes
 */
export function convertToMinutes(hours: number, minutes: number, seconds: number): number {
    return hours * 60 + minutes + seconds / 60;
}

/**
 * Converts total minutes to an object with hours, minutes, and seconds
 */
export function convertFromMinutes(totalMinutes: number): {
    hours: number;
    minutes: number;
    seconds: number;
} {
    if (totalMinutes === null || isNaN(totalMinutes)) {
        return { hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.round((totalMinutes % 1) * 60);

    return { hours, minutes, seconds };
}

/**
 * Determines if a field is a time-related field based on its key
 */
export function isTimeField(key: string): boolean {
    const timeFields = [
        'plannedProductionTime',
        'actualProductionTime',
        'totalDowntime',
        'totalTimeTaken',
        'changeoverTime',
        'actualMachineRunTime',
        'availableMachineTime'
    ];

    return timeFields.includes(key);
}

interface MachineData {
    machineId: number;
    machineName: string;
}

interface FormData {
    [key: string]: number | null;
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

export function ProductionInputForm() {
    const [machines, setMachines] = useState<MachineData[]>([]);
    const [formData, setFormData] = useState<{ [key: number]: FormData }>({});
    const [expandedMachine, setExpandedMachine] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        axios.get('https://neura-ops.onrender.com/api/v1/machine',
            {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token'),
                },
            }
        )
            .then(response => {
                setMachines(response.data.machines);
                const initialFormData: { [key: number]: FormData } = {};
                response.data.machines.forEach((machine: MachineData) => {
                    initialFormData[machine.machineId] = fieldMappings.reduce((acc, field) => ({
                        ...acc,
                        [field.key]: null
                    }), {});
                    initialFormData[machine.machineId].machineId = machine.machineId;
                });
                setFormData(initialFormData);
            })
            .catch(() => {
                toast({
                    title: "Error fetching machines",
                    description: "Could not load machines. Please try again.",
                    variant: "destructive"
                });
            });
    }, [toast]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, machineId: number, key: keyof FormData) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [machineId]: {
                ...prev[machineId],
                [key]: Number(value) || 0
            }
        }));
    };

    const handleTimeInputChange = (machineId: number, key: keyof FormData, valueInMinutes: number) => {
        setFormData((prev) => ({
            ...prev,
            [machineId]: {
                ...prev[machineId],
                [key]: valueInMinutes
            }
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await Promise.all(machines.map(machine =>
                axios.post(`https://neura-ops.onrender.com/api/v1/production/`, formData[machine.machineId],
                    {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem('token'),
                        },
                    }
                )
            ));
            toast({
                title: "Success!",
                description: "Production data for all machines has been stored."
            });
        } catch (error) {
            toast({
                title: "Error saving data",
                description: "There was an issue saving the data. Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto py-8 px-4 w-screen"
        >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Factory className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Machine Production Data Entry
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        Enter daily production metrics for each machine
                    </p>
                </div>
                <Link to="/add-machine">
                    <Button variant="outline" className="shadow-sm hover:shadow-md transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Add Machine
                    </Button>
                </Link>
            </div>

            <Separator className="my-6" />

            <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence>
                    {machines.map((machine, index) => (
                        <motion.div
                            key={machine.machineId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2, delay: index * 0.1 }}
                            className="border-2 rounded-lg shadow-lg overflow-hidden"
                        >
                            <div
                                className="p-4 bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                onClick={() => setExpandedMachine(expandedMachine === index ? null : index)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Factory className="h-6 w-6 text-primary" />
                                        <h2 className="text-2xl font-semibold">
                                            {machine.machineName || "Unnamed Machine"}
                                        </h2>
                                    </div>
                                    {expandedMachine === index ? (
                                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedMachine === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="border-0 shadow-none">
                                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
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
                                                                <div className="relative">
                                                                    <Input
                                                                        type="number"
                                                                        value={formData[machine.machineId]?.[key] ?? ''}
                                                                        onChange={(e) => handleInputChange(e, machine.machineId, key)}
                                                                        className="transition-all focus:ring-2 focus:ring-primary/20"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <div className="flex justify-between items-center pt-6">
                    <Link to="/">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="hover:bg-secondary/80 transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" /> Back
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        size="lg"
                        className="shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
                    >
                        <Save className="mr-2 h-5 w-5" /> Save Data
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}

export default ProductionInputForm;