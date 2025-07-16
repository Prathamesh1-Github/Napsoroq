import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrapReasonMultiSelect } from "./ScrapReasonMultiSelect";
import { ArrowLeft, Save, Package2, Calculator, AlertTriangle } from "lucide-react";

export const productionFormSchema = z.object({
    totalUnitsProduced: z.number().min(0, "Must be a positive number"),
    goodUnitsProduced: z.number().min(0, "Must be a positive number"),
    goodUnitsWithoutRework: z.number().min(0, "Must be a positive number"),
    scrapUnits: z.number().min(0, "Must be a positive number"),
    scrapReasons: z.array(z.string()).optional()
});

interface ProductData {
    _id: string;
    productName: string;
    uom: string;
}

interface ScrapReason {
    _id: string;
    reason: string;
}

interface FormData {
    totalUnitsProduced: number | null;
    goodUnitsProduced: number | null;
    goodUnitsWithoutRework: number | null;
    scrapUnits: number | null;
    scrapReasons: string[];
    productId?: string;
    estimatedMaterialUsed?: { [key: string]: number };
    actualMaterialUsed?: { [key: string]: number };
}

const fieldMappings: { label: string; key: keyof FormData; icon: any }[] = [
    { label: "Total Quantity Produced", key: "totalUnitsProduced", icon: Package2 },
    { label: "Good Quantity Produced", key: "goodUnitsProduced", icon: Package2 },
    { label: "Good Quantity Without Rework", key: "goodUnitsWithoutRework", icon: Package2 },
    { label: "Scrap Quantity", key: "scrapUnits", icon: Package2 }
];

export function ProductProductionInputForm() {
    const [finishedProducts, setFinishedProducts] = useState<ProductData[]>([]);
    const [semiFinishedProducts, setSemiFinishedProducts] = useState<ProductData[]>([]);
    const [scrapReasons, setScrapReasons] = useState<ScrapReason[]>([]);
    const [formData, setFormData] = useState<{ [key: string]: FormData }>({});
    const [estimatedUsage, setEstimatedUsage] = useState<{ [key: string]: number }>({});
    const [actualUsage, setActualUsage] = useState<{ [key: string]: number }>({});
    const [estimatedSemiFinishedUsage, setEstimatedSemiFinishedUsage] = useState<{ [key: string]: number }>({});
    const [actualSemiFinishedUsage, setActualSemiFinishedUsage] = useState<{ [key: string]: number }>({});
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [finishedRes, semiRes, scrapRes] = await Promise.all([
                    axios.get("https://neura-ops.onrender.com/api/v1/product/with-machines", {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem('token'),
                        },
                    }),
                    axios.get("https://neura-ops.onrender.com/api/v1/semifinished/with-machines", {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem('token'),
                        },
                    }),
                    axios.get("https://neura-ops.onrender.com/api/v1/scrapreasons", {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem('token'),
                        },
                    })
                ]);

                setFinishedProducts(finishedRes.data.products);
                setSemiFinishedProducts(semiRes.data.products);
                setScrapReasons(scrapRes.data || []);

                const combined = [...finishedRes.data.products, ...semiRes.data.products];
                const initialFormData: { [key: string]: FormData } = {};
                combined.forEach((product: ProductData) => {
                    initialFormData[product._id] = {
                        totalUnitsProduced: null,
                        goodUnitsProduced: null,
                        goodUnitsWithoutRework: null,
                        scrapUnits: null,
                        scrapReasons: [],
                        productId: product._id
                    };
                });
                setFormData(initialFormData);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch product data",
                    variant: "destructive"
                });
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (productId: string, key: keyof FormData, value: string) => {
        const numValue = value === '' ? null : Number(value);
        setFormData((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [key]: numValue
            }
        }));
    };

    const getCleanNumberInputValue = (val: unknown): string | number => {
        if (typeof val === 'number' || typeof val === 'string') return val;
        return '';
    };


    const handleScrapReasonChange = (productId: string, selectedReasons: string[]) => {
        setFormData((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                scrapReasons: selectedReasons
            }
        }));
    };

    const handleAddNewScrapReason = async (reason: string) => {
        try {
            const response = await axios.post(
                'https://neura-ops.onrender.com/api/v1/scrapreasons',
                { reason },
                {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token'),
                    },
                }
            );

            const newScrapReason = response.data.scrapReason;
            setScrapReasons(prev => [...prev, newScrapReason]);

            toast({
                title: "Success",
                description: "New scrap reason added successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add new scrap reason",
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleCalculate = async () => {
        try {
            const { data } = await axios.post(
                'https://neura-ops.onrender.com/api/v1/productproduction/estimated',
                Object.values(formData),
                {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token'),
                    },
                }
            );

            // Filter out zero values for raw materials
            const filteredMaterialUsage = Object.entries(data.estimatedMaterialUsage as Record<string, number>)
                .reduce((acc, [key, value]) => {
                    if (value > 0) acc[key] = value;
                    return acc;
                }, {} as { [key: string]: number });

            // Filter out zero values for semi-finished products
            const filteredSemiFinishedUsage = Object.entries(data.estimatedSemiFinishedUsage as Record<string, number>)
                .reduce((acc, [key, value]) => {
                    if (value > 0) acc[key] = value;
                    return acc;
                }, {} as { [key: string]: number });

            setEstimatedUsage(filteredMaterialUsage);
            setActualUsage(filteredMaterialUsage);
            setEstimatedSemiFinishedUsage(filteredSemiFinishedUsage);
            setActualSemiFinishedUsage(filteredSemiFinishedUsage);

            toast({
                title: "Success",
                description: "Estimated usage calculated successfully",
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to calculate estimated usage",
                variant: "destructive"
            });
        }
    };

    const handleActualUsageChange = (matId: string, value: string) => {
        setActualUsage(prev => ({
            ...prev,
            [matId]: Number(value) || 0
        }));
    };

    const handleActualSemiFinishedUsageChange = (productId: string, value: string) => {
        setActualSemiFinishedUsage(prev => ({
            ...prev,
            [productId]: Number(value) || 0
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            Object.entries(formData).forEach(([_, data]) => {
                productionFormSchema.parse(data);
            });

            const allProducts = [...finishedProducts, ...semiFinishedProducts];

            await Promise.all(allProducts.map(product => {
                const isSemiFinished = semiFinishedProducts.some(p => p._id === product._id);

                const form = {
                    ...formData[product._id],
                    productType: isSemiFinished ? 'SemiFinishedProduct' : 'Product',
                    estimatedMaterialUsed: {
                        ...estimatedUsage,  // Raw materials
                        ...estimatedSemiFinishedUsage  // Semi-finished components
                    },
                    actualMaterialUsed: {
                        ...actualUsage,  // Raw materials
                        ...actualSemiFinishedUsage  // Semi-finished components
                    }
                };

                return axios.post(`https://neura-ops.onrender.com/api/v1/productproduction/`, form, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token'),
                    },
                });
            }));

            toast({
                title: "Success",
                description: "Production data saved successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof z.ZodError
                    ? "Validation error. Check your inputs."
                    : "Failed to save production data",
                variant: "destructive"
            });
        }
    };

    const renderProductAccordion = (title: string, products: ProductData[]) => (
        <div>
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <Accordion type="single" collapsible className="space-y-4">
                {products.map(product => (
                    <AccordionItem key={product._id} value={product._id}>
                        <AccordionTrigger className="px-4">
                            <div className="flex items-center gap-2">
                                <Package2 className="h-5 w-5" />
                                <span className="font-semibold">{product.productName}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Production Metrics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Production Metrics Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {fieldMappings.map(({ label, key, icon: Icon }) => (
                                            <div key={key} className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    {label} ({product.uom})
                                                </Label>
                                                {/* <Input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        typeof formData[product._id]?.[key] === 'number' || typeof formData[product._id]?.[key] === 'string'
                                                          ? formData[product._id]?.[key]
                                                          : ''
                                                      }                                                      
                                                    onChange={(e) => handleInputChange(product._id, key, e.target.value)}
                                                /> */}
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={getCleanNumberInputValue(formData[product._id]?.[key])}
                                                    onChange={(e) => handleInputChange(product._id, key, e.target.value)}
                                                />

                                            </div>
                                        ))}
                                    </div>

                                    {/* Scrap Reasons Section */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <Label className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                            Scrap Reasons
                                        </Label>
                                        <ScrapReasonMultiSelect
                                            scrapReasons={scrapReasons}
                                            selectedReasons={formData[product._id]?.scrapReasons ?? []}
                                            onSelectionChange={(selectedReasons) =>
                                                handleScrapReasonChange(product._id, selectedReasons)
                                            }
                                            onAddNewReason={handleAddNewScrapReason}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );

    return (
        <div className="container mx-auto py-8 space-y-8 w-screen">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Production Data Entry</h1>
                    <p className="text-muted-foreground">Record production for semi-finished and finished products</p>
                </div>
                <Button type="button" onClick={handleCalculate} className="gap-2">
                    <Calculator className="h-4 w-4" />
                    Calculate Estimated Usage
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {renderProductAccordion("Semi-Finished Products", semiFinishedProducts)}
                {renderProductAccordion("Finished Products", finishedProducts)}

                {Object.keys(estimatedUsage).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Material Usage Estimation</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Raw Materials Section */}
                            <div className="col-span-2">
                                <h3 className="text-lg font-semibold mb-4">Raw Materials</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.entries(estimatedUsage).map(([matId, qty]) => (
                                        <div key={matId} className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Package2 className="h-4 w-4" />
                                                {matId} (Raw Material)
                                            </Label>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Estimated: {qty} units</p>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Enter actual usage"
                                                    value={actualUsage[matId] !== undefined ? actualUsage[matId] : ''}
                                                    onChange={(e) => handleActualUsageChange(matId, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Semi-Finished Products Section */}
                            {Object.keys(estimatedSemiFinishedUsage).length > 0 && (
                                <div className="col-span-2">
                                    <h3 className="text-lg font-semibold mb-4">Semi-Finished Products</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(estimatedSemiFinishedUsage).map(([productId, qty]) => (
                                            <div key={productId} className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Package2 className="h-4 w-4" />
                                                    {productId} (Semi-Finished)
                                                </Label>
                                                <div className="space-y-1">
                                                    <p className="text-sm text-muted-foreground">Estimated: {qty} units</p>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="Enter actual usage"
                                                        value={actualSemiFinishedUsage[productId] !== undefined ? actualSemiFinishedUsage[productId] : ''}
                                                        onChange={(e) => handleActualSemiFinishedUsageChange(productId, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-between pt-6">
                    <Link to="/">
                        <Button type="button" variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <Button type="submit" className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Production Data
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default ProductProductionInputForm;