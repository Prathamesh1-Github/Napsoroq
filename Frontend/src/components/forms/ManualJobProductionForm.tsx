import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Package2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
    _id: string;
    productName: string;
    productType: 'Product' | 'SemiFinishedProduct';
    manualJobId: string;
    uom: string;
}


interface FormData {
    productId: string;
    productType: 'Product' | 'SemiFinishedProduct';
    manualJobId: string;
    outputQuantity: number;
    reworkQuantity: number;
    scrapQuantity: number;
    actualTimeTaken: number;
}

export default function ManualJobProductionForm() {
    const [products, setProducts] = useState<Product[]>([]);
    const [formData, setFormData] = useState<{ [key: string]: FormData }>({});
    const { toast } = useToast();


    useEffect(() => {
        const fetchProductsWithManualJobs = async () => {
            try {
                const [productsRes, semiFinishedRes] = await Promise.all([
                    axios.get('https://neura-ops.onrender.com/api/v1/product/with-manual-jobs',
                        {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                    ),
                    axios.get('https://neura-ops.onrender.com/api/v1/semifinished/with-manual-jobs',
                        {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                    ),
                ]);
    
                const semiFinishedProducts: Product[] = semiFinishedRes.data.products.map((item: any) => ({
                    _id: item._id,
                    productName: item.productName,
                    productType: 'SemiFinishedProduct',
                    manualJobId: item.manualJobs[0]?.jobId?._id,
                    uom: item.uom
                }));
    
                const finishedProducts: Product[] = productsRes.data.products.map((item: any) => ({
                    _id: item._id,
                    productName: item.productName,
                    productType: 'Product',
                    manualJobId: item.manualJobs[0]?.jobId?._id,
                    uom: item.uom
                }));
    
                const allProducts = [...semiFinishedProducts, ...finishedProducts];
    
                setProducts(allProducts);
    
                const initialFormData: { [key: string]: FormData } = {};
                allProducts.forEach((product) => {
                    initialFormData[product._id] = {
                        productId: product._id,
                        productType: product.productType,
                        manualJobId: product.manualJobId,
                        outputQuantity: 0,
                        reworkQuantity: 0,
                        scrapQuantity: 0,
                        actualTimeTaken: 0,
                    };
                });
    
                setFormData(initialFormData);
            } catch (error) {
                console.error('Error fetching manual job products:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to fetch manual job products. Please try again.',
                    variant: 'destructive',
                });
            }
        };
    
        fetchProductsWithManualJobs();
    }, [toast]);


    const handleInputChange = (
        productId: string,
        field: keyof Omit<FormData, 'inputQuantities' | 'productId' | 'productType' | 'manualJobId'>,
        value: number
    ) => {
        setFormData((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            for (const product of products) {
                const data = formData[product._id];
                await axios.post('https://neura-ops.onrender.com/api/v1/manual-job-productions', data, 
                    {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                );
            }
            toast({
                title: 'Success',
                description: 'Manual job production data saved successfully.',
            });
        } catch (error) {
            console.error('Error submitting data:', error);
            toast({
                title: 'Error',
                description: 'Failed to save manual job production data.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-8 w-screen">
            <h1 className="text-3xl font-bold tracking-tight">Manual Job Production Entry</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <Accordion type="single" collapsible className="space-y-4">
                    {products.map((product) => (
                        <AccordionItem key={product._id} value={product._id} className="border rounded-lg p-2">
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
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Output Quantity ({product.uom})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={formData[product._id]?.outputQuantity || ''}
                                                onChange={(e) =>
                                                    handleInputChange(product._id, 'outputQuantity', Number(e.target.value))
                                                }
                                                placeholder={`Enter Output quantity in ${product.uom}`}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Rework Quantity ({product.uom})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={formData[product._id]?.reworkQuantity || ''}
                                                onChange={(e) =>
                                                    handleInputChange(product._id, 'reworkQuantity', Number(e.target.value))
                                                }
                                                placeholder={`Enter Rework quantity in ${product.uom}`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Scrap Quantity ({product.uom})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={formData[product._id]?.scrapQuantity || ''}
                                                onChange={(e) =>
                                                    handleInputChange(product._id, 'scrapQuantity', Number(e.target.value))
                                                }
                                                placeholder={`Enter Scrap quantity in ${product.uom}`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Time Taken (mins)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={formData[product._id]?.actualTimeTaken || ''}
                                                onChange={(e) =>
                                                    handleInputChange(product._id, 'actualTimeTaken', Number(e.target.value))
                                                }
                                            />
                                        </div>

                                    </CardContent>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <Button type="submit" className="w-full">
                    <Save className="mr-2 h-4 w-4" /> Save All Entries
                </Button>
            </form>
        </div>
    );
}
