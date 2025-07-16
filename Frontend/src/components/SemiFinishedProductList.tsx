import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { 
    Package, 
    Plus, 
    Box,
    DollarSign,
    Scale,
    Truck,
    AlertCircle,
    Settings,
    Loader2,
    Edit,
    Trash2,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,    
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SemiFinishedProduct {
    _id: string;
    productId?: string;
    productName: string;
    productCategory?: string;
    productSKU?: string;
    productVariant?: string;
    batchSize?: number;
    productWeight?: number;
    totalMaterialCost: number;
    laborCost: number;
    machineCost: number;
    overheadCost: number;
    profitMargin?: number;
    currentStock: number;
    minimumStockLevel: number;
    reorderPoint?: number;
    leadTime?: number;
    qualityCheckRequired: boolean;
    inspectionCriteria?: string;
    defectTolerance?: number;
    rawMaterials: Array<{
        rawMaterialId: string;
        rawMaterialName?: string;
        quantity: number;
        _id?: string;
    }>;
    semiFinishedComponents: Array<{
        productId: string | { _id: string; productName: string };
        productName?: string;
        quantity: number;
        _id?: string;
    }>;
    machines: Array<{
        machineId: string;
        machineName?: string;
        cycleTime: number;
        _id?: string;
    }>;
    manualJobs: Array<{
        jobId: string | { _id: string; jobName: string };
        jobName?: string;
        expectedTimePerUnit: number;
        _id?: string;
    }>;
    createdAt: string;
    updatedAt: string;
    totalProductionCost?: number;
    finalSellingPrice?: number;
    createdByType?: string;
    createdById?: string;
    unitOfMeasure?: string;
    description?: string;
    maximumStockLevel?: number;
    location?: string;
    qualityStatus?: string;
    notes?: string;
}

const stockLevelColor = {
    high: "text-green-500",
    medium: "text-yellow-500",
    low: "text-red-500",
};

const stockLevelBg = {
    high: "bg-green-500/10",
    medium: "bg-yellow-500/10",
    low: "bg-red-500/10",
};

export function SemiFinishedProductList() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [products, setProducts] = useState<SemiFinishedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(
                "https://neura-ops.onrender.com/api/v1/semifinished",
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            
            // Handle the specific response format where products are directly in response.data
            const productsData = response.data.products || [];
            setProducts(Array.isArray(productsData) ? productsData : []);
            
            console.log("Fetched products:", productsData);
        } catch (error) {
            console.error("Error fetching semi-finished products:", error);
            setError("Failed to fetch semi-finished products. Please try again.");
            toast({
                title: "Error",
                description: "Failed to fetch semi-finished products. Please try again.",
                variant: "destructive",
            });
            setProducts([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(
                `https://neura-ops.onrender.com/api/v1/semifinished/${id}`,
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            toast({
                title: "Success",
                description: "Semi-finished product deleted successfully",
            });
            fetchProducts();
        } catch (error) {
            console.error("Error deleting semi-finished product:", error);
            toast({
                title: "Error",
                description: "Failed to delete semi-finished product. Please try again.",
                variant: "destructive",
            });
        }
    };

    const getStockLevel = (current: number, minimum: number) => {
        if (current === 0) return "low";
        const ratio = current / minimum;
        if (ratio > 2) return "high";
        if (ratio > 1) return "medium";
        return "low";
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value || 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading semi-finished products...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-500 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container w-screen mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Semi-Finished Products</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and monitor your semi-finished product inventory
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={() => navigate("/semi-finished/create")}>
                        <Plus className="h-4 w-4 mr-2" /> Add New Product
                    </Button>
                    <Badge variant="outline" className="font-semibold">
                        {products.length} Total Products
                    </Badge>
                </div>
            </div>

            <AnimatePresence>
                {products.map((product, index) => (
                    <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Box className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{product.productName || 'Unnamed Product'}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <Package className="h-4 w-4" />
                                                SKU: {product.productSKU || 'No SKU'}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className={cn(
                                                "font-medium",
                                                stockLevelBg[getStockLevel(product.currentStock || 0, product.minimumStockLevel || 1)],
                                                stockLevelColor[getStockLevel(product.currentStock || 0, product.minimumStockLevel || 1)]
                                            )}
                                        >
                                            {product.currentStock || 0} in stock
                                        </Badge>
                                        {product.qualityCheckRequired && (
                                            <Badge variant="outline" className="font-medium text-blue-500">
                                                QC Required
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <span>Total Material Cost: {formatCurrency(product.totalMaterialCost)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Scale className="h-4 w-4 text-muted-foreground" />
                                            <span>Category: {product.productCategory || 'Uncategorized'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Truck className="h-4 w-4 text-muted-foreground" />
                                            <span>Reorder Point: {product.reorderPoint || 0} units</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            <span>Batch Size: {product.batchSize || 0} units</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                Components
                                            </h3>
                                            {product.currentStock <= (product.reorderPoint || 0) && (
                                                <span className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Reorder Required
                                                </span>
                                            )}
                                        </div>
                                        
                                        {product.rawMaterials && product.rawMaterials.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium mb-2">Raw Materials</h4>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Material</TableHead>
                                                            <TableHead className="text-right">Quantity</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {product.rawMaterials.map((material) => (
                                                            <TableRow key={material.rawMaterialId || Math.random()}>
                                                                <TableCell className="font-medium">
                                                                    {material.rawMaterialName || 'Unknown Material'}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {material.quantity || 0}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Minimum Stock Level: {product.minimumStockLevel || 0} units
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => navigate(`/semi-finished/${product._id}`)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" /> View
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => navigate(`/semi-finished/edit/${product._id}`)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" /> Edit
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="text-destructive"
                                            onClick={() => handleDelete(product._id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </div>

                                {product.manualJobs && product.manualJobs.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium mb-2">Manual Jobs</h4>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Job</TableHead>
                                                    <TableHead className="text-right">Time/Unit</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {product.manualJobs.map((job) => {
                                                    const jobIdObj = typeof job.jobId === 'object' ? job.jobId as { _id: string; jobName: string } : null;
                                                    return (
                                                        <TableRow key={jobIdObj ? jobIdObj._id : (job.jobId as string) || Math.random()}>
                                                            <TableCell className="font-medium">
                                                                {jobIdObj ? jobIdObj.jobName : (job.jobName || 'Unknown Job')}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {job.expectedTimePerUnit || 0} min
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}

                                {product.machines && product.machines.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium mb-2">Machines</h4>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Machine</TableHead>
                                                    <TableHead className="text-right">Cycle Time</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {product.machines.map((machine) => {
                                                    const machineIdObj = typeof machine.machineId === 'object' ? machine.machineId as { _id: string; machineName: string } : null;
                                                    return (
                                                        <TableRow key={machineIdObj ? machineIdObj._id : (machine.machineId as string) || Math.random()}>
                                                            <TableCell className="font-medium">
                                                                {machineIdObj ? machineIdObj.machineName : (machine.machineName || 'Unknown Machine')}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {machine.cycleTime || 0} min
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
} 
