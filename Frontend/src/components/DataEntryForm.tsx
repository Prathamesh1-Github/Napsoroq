import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

interface FormData {
    plannedProductionTime: number | null;
    actualProductionTime: number | null;
    totalUnitsProduced: number | null;
    goodUnitsProduced: number | null;
    goodUnitsWithoutRework: number | null;
    scrapUnits: number | null;
    idealCycleTime: number | null;
    totalDowntime: number | null;
    totalTimeTaken: number | null;
    changeoverTime: number | null;
    actualMachineRunTime: number | null;
    availableMachineTime: number | null;
    maxProductionCapacity: number | null;
}


const fieldMappings: { label: string; key: keyof FormData }[] = [
    { label: "Planned Production Time (Minutes/Hours)", key: "plannedProductionTime" },
    { label: "Actual Production Time (Minutes/Hours)", key: "actualProductionTime" },
    { label: "Total Units Produced (Units)", key: "totalUnitsProduced" },
    { label: "Good Units Produced (Units)", key: "goodUnitsProduced" },
    { label: "Good Units Produced without Rework (Units)", key: "goodUnitsWithoutRework" },
    { label: "Scrap Units (Units)", key: "scrapUnits" },
    { label: "Ideal Cycle Time (Seconds per Unit)", key: "idealCycleTime" },
    { label: "Total Downtime (Minutes/Hours)", key: "totalDowntime" },
    { label: "Total Time Taken (Minutes/Hours)", key: "totalTimeTaken" },
    { label: "Time Taken for Changeover (Minutes)", key: "changeoverTime" },
    { label: "Actual Machine Run Time (Minutes/Hours)", key: "actualMachineRunTime" },
    { label: "Available Machine Time (Minutes/Hours)", key: "availableMachineTime" },
    { label: "Maximum Production Capacity (Units per Time)", key: "maxProductionCapacity" }
];

export function DataEntryForm() {
    const { toast } = useToast();

    const [formData, setFormData] = useState<FormData>({
        plannedProductionTime: null,
        actualProductionTime: null,
        totalUnitsProduced: null,
        goodUnitsProduced: null,
        goodUnitsWithoutRework: null,
        scrapUnits: null,
        idealCycleTime: null,
        totalDowntime: null,
        totalTimeTaken: null,
        changeoverTime: null,
        actualMachineRunTime: null,
        availableMachineTime: null,
        maxProductionCapacity: null
    });

    // Handle input change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, key: keyof FormData) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [key]: Number(value) || 0 // Ensure a valid number is stored
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('https://neura-ops.onrender.com/api/v1/production', formData, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token'),
                },
            });
            toast({
                title: "Data saved successfully",
                description: "Your production data has been stored in the database."
            });
            // navigate('/'); // This line was removed as per the edit hint
        } catch (error) {
            toast({
                title: "Error saving data",
                description: "There was an issue saving your data. Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="space-y-6 w-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Production Data Entry</h1>
                    <p className="text-muted-foreground">Enter your daily Production metrics</p>
                </div>
                <Button variant="outline" onClick={() => window.history.back()}> <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="oee" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="oee">Production Data</TabsTrigger>
                    </TabsList>
                    <TabsContent value="oee">
                        <Card>
                            <CardHeader>
                                <CardTitle>Production Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {fieldMappings.map(({ label, key }, index) => (
                                        <div key={index} className="space-y-2">
                                            <Label htmlFor={key}>{label}</Label>
                                            <Input
                                                id={key}
                                                type="number"
                                                value={formData[key] === null ? '' : formData[key]}
                                                onChange={(e) => handleInputChange(e, key)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <CardFooter className="flex justify-between mt-6">
                    <Button variant="outline" type="button" onClick={() => window.history.back()}>Cancel</Button>
                    <Button type="submit"> <Save className="mr-2 h-4 w-4" /> Save Data </Button>
                </CardFooter>
            </form>
        </div>
    );
}