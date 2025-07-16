import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface ProcessMapInputProps {
    processMap: any[];
    onChange: (processMap: any[]) => void;
}

interface Item {
    _id: string;
    name: string;
    type: string;
}

export function ProcessMapInput({ processMap, onChange }: ProcessMapInputProps) {
    const [rawMaterials, setRawMaterials] = useState<Item[]>([]);
    const [semiFinishedProducts, setSemiFinishedProducts] = useState<Item[]>([]);
    const [products, setProducts] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const [rawMaterialsRes, semiFinishedRes, productsRes] = await Promise.all([
                    axios.get('https://neura-ops.onrender.com/api/v1/rawmaterial', 
                        {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                    ),
                    axios.get('https://neura-ops.onrender.com/api/v1/semifinished', 
                        {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                    ),
                    axios.get('https://neura-ops.onrender.com/api/v1/product', 
                        {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                    )
                ]);

                // Handle raw materials - updated to match the actual data structure
                if (rawMaterialsRes.data && Array.isArray(rawMaterialsRes.data.rawMaterials)) {
                    setRawMaterials(rawMaterialsRes.data.rawMaterials.map((item: any) => ({
                        _id: item._id,
                        name: item.rawMaterialName || 'Unknown',
                        type: 'RawMaterial'
                    })));
                } else if (rawMaterialsRes.data && Array.isArray(rawMaterialsRes.data.data)) {
                    // Fallback to the previous format
                    setRawMaterials(rawMaterialsRes.data.data.map((item: any) => ({
                        _id: item._id,
                        name: item.rawMaterialName || item.name || 'Unknown',
                        type: 'RawMaterial'
                    })));
                } else {
                    console.warn('Raw materials data is not in the expected format:', rawMaterialsRes.data);
                    setRawMaterials([]);
                }

                // Handle semi-finished products
                if (semiFinishedRes.data && Array.isArray(semiFinishedRes.data.data)) {
                    setSemiFinishedProducts(semiFinishedRes.data.data.map((item: any) => ({
                        _id: item._id,
                        name: item.productName || item.name || 'Unknown',
                        type: 'SemiFinishedProduct'
                    })));
                } else {
                    console.warn('Semi-finished products data is not in the expected format:', semiFinishedRes.data);
                    setSemiFinishedProducts([]);
                }

                // Handle products - updated to match the actual data structure
                if (productsRes.data && Array.isArray(productsRes.data.products)) {
                    setProducts(productsRes.data.products.map((item: any) => ({
                        _id: item._id,
                        name: item.productName || 'Unknown',
                        type: 'Product'
                    })));
                } else if (productsRes.data && Array.isArray(productsRes.data.data)) {
                    // Fallback to the previous format
                    setProducts(productsRes.data.data.map((item: any) => ({
                        _id: item._id,
                        name: item.productName || item.name || 'Unknown',
                        type: 'Product'
                    })));
                } else {
                    console.warn('Products data is not in the expected format:', productsRes.data);
                    setProducts([]);
                }
            } catch (error) {
                console.error('Error fetching items:', error);
                toast({
                    title: "Error",
                    description: "Failed to fetch items. Please try again.",
                    variant: "destructive",
                });
                // Set empty arrays to prevent undefined errors
                setRawMaterials([]);
                setSemiFinishedProducts([]);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [toast]);

    const addProcessMap = () => {
        onChange([...processMap, { inputs: [], output: null }]);
    };

    const removeProcessMap = (index: number) => {
        const newProcessMap = [...processMap];
        newProcessMap.splice(index, 1);
        onChange(newProcessMap);
    };

    const addInput = (processMapIndex: number) => {
        const newProcessMap = [...processMap];
        if (!newProcessMap[processMapIndex].inputs) {
            newProcessMap[processMapIndex].inputs = [];
        }
        newProcessMap[processMapIndex].inputs.push({
            item: '',
            itemType: 'RawMaterial',
            quantity: 0
        });
        onChange(newProcessMap);
    };

    const removeInput = (processMapIndex: number, inputIndex: number) => {
        const newProcessMap = [...processMap];
        if (newProcessMap[processMapIndex].inputs) {
            newProcessMap[processMapIndex].inputs.splice(inputIndex, 1);
            onChange(newProcessMap);
        }
    };

    const updateInput = (processMapIndex: number, inputIndex: number, field: string, value: any) => {
        const newProcessMap = [...processMap];
        if (newProcessMap[processMapIndex].inputs && newProcessMap[processMapIndex].inputs[inputIndex]) {
            newProcessMap[processMapIndex].inputs[inputIndex][field] = value;
            onChange(newProcessMap);
        }
    };

    const updateOutput = (processMapIndex: number, field: string, value: any) => {
        const newProcessMap = [...processMap];
        if (!newProcessMap[processMapIndex].output) {
            newProcessMap[processMapIndex].output = {};
        }
        newProcessMap[processMapIndex].output[field] = value;
        onChange(newProcessMap);
    };

    const getItemsByType = (type: string) => {
        switch (type) {
            case 'RawMaterial':
                return rawMaterials;
            case 'SemiFinishedProduct':
                return semiFinishedProducts;
            case 'Product':
                return products;
            default:
                return [];
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Process Map</h3>
                <Button onClick={addProcessMap} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Process
                </Button>
            </div>

            {processMap && processMap.length > 0 ? (
                processMap.map((process, processIndex) => (
                    <Card key={processIndex} className="mb-4">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Process {processIndex + 1}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProcessMap(processIndex)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label>Inputs</Label>
                                    <div className="space-y-2">
                                        {process.inputs && process.inputs.map((input: any, inputIndex: number) => (
                                            <div key={inputIndex} className="flex items-center space-x-2">
                                                <Select
                                                    value={input.itemType || 'RawMaterial'}
                                                    onValueChange={(value) =>
                                                        updateInput(processIndex, inputIndex, 'itemType', value)
                                                    }
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="RawMaterial">Raw Material</SelectItem>
                                                        <SelectItem value="SemiFinishedProduct">
                                                            Semi-Finished Product
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Select
                                                    value={input.item || ''}
                                                    onValueChange={(value) =>
                                                        updateInput(processIndex, inputIndex, 'item', value)
                                                    }
                                                >
                                                    <SelectTrigger className="w-[200px]">
                                                        <SelectValue placeholder="Select item" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getItemsByType(input.itemType || 'RawMaterial').map(
                                                            (item) => (
                                                                <SelectItem key={item._id} value={item._id}>
                                                                    {item.name}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>

                                                <Input
                                                    type="number"
                                                    placeholder="Quantity"
                                                    value={input.quantity || ''}
                                                    onChange={(e) =>
                                                        updateInput(
                                                            processIndex,
                                                            inputIndex,
                                                            'quantity',
                                                            parseFloat(e.target.value)
                                                        )
                                                    }
                                                    className="w-[100px]"
                                                />

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeInput(processIndex, inputIndex)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addInput(processIndex)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Input
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <Label>Output</Label>
                                    <div className="flex items-center space-x-2">
                                        <Select
                                            value={process.output?.itemType || ''}
                                            onValueChange={(value) =>
                                                updateOutput(processIndex, 'itemType', value)
                                            }
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="SemiFinishedProduct">
                                                    Semi-Finished Product
                                                </SelectItem>
                                                <SelectItem value="Product">Product</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={process.output?.item || ''}
                                            onValueChange={(value) =>
                                                updateOutput(processIndex, 'item', value)
                                            }
                                        >
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="Select item" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getItemsByType(process.output?.itemType || '').map(
                                                    (item) => (
                                                        <SelectItem key={item._id} value={item._id}>
                                                            {item.name}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            type="number"
                                            placeholder="Quantity"
                                            value={process.output?.quantity || ''}
                                            onChange={(e) =>
                                                updateOutput(
                                                    processIndex,
                                                    'quantity',
                                                    parseFloat(e.target.value)
                                                )
                                            }
                                            className="w-[100px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center p-8 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">No processes added yet. Click "Add Process" to get started.</p>
                </div>
            )}
        </div>
    );
} 