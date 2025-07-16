import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Package,
    Search,
    Box,
    DollarSign,
    Scale,
    Truck,
    AlertCircle,
    Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";


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


// ...imports stay the same

interface Product {
    _id: string;
    productId: string;
    productName: string;
    productCategory: string;
    productSKU: string;
    uom: string;
    productVariant: string;
    sellingPrice: number;
    batchSize: number;
    productWeight: number;
    totalMaterialCost: number;
    laborCost: number;
    machineCost: number;
    overheadCost: number;
    totalProductionCost: number;
    profitMargin: number;
    finalSellingPrice: number;
    currentStock: number;
    minimumStockLevel: number;
    reorderPoint: number;
    leadTime: number;
    qualityCheckRequired: boolean;
    inspectionCriteria: string;
    defectTolerance: number;
    rawMaterials: Array<{
        rawMaterialId: string;
        quantity: number;
    }>;
    semiFinishedComponents: Array<{
        productId: string;
        quantity: number;
    }>;
    machines: Array<{
        machineId: string;
        cycleTime: number;
    }>;
    manualJobs: Array<{
        jobId: string;
        expectedTimePerUnit: number;
    }>;
}

export function ProductDashboard({ products = [] }: { products: Product[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredProducts = products.filter((product) =>
        product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productSKU?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStockLevel = (current: number, minimum: number) => {
        const ratio = current / minimum;
        if (ratio > 2) return "high";
        if (ratio > 1) return "medium";
        return "low";
    };

    return (
        <div className="container w-screen mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Product Inventory</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and monitor your product inventory
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search products..."
                            className="pl-10 w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="font-semibold">
                        {products.length} Total Products
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                    {filteredProducts.map((product: Product, index: number) => (
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
                                                <CardTitle className="text-xl">
                                                    {product.productName}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <Package className="h-4 w-4" />
                                                    SKU: {product.productSKU}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                className={cn(
                                                    "font-medium",
                                                    stockLevelBg[getStockLevel(
                                                        product.currentStock,
                                                        product.minimumStockLevel
                                                    ) as keyof typeof stockLevelBg],
                                                    stockLevelColor[getStockLevel(
                                                        product.currentStock,
                                                        product.minimumStockLevel
                                                    ) as keyof typeof stockLevelColor]
                                                )}
                                            >
                                                {product.currentStock} in stock
                                            </Badge>
                                            {product.qualityCheckRequired && (
                                                <Badge
                                                    variant="outline"
                                                    className="font-medium text-blue-500"
                                                >
                                                    QC Required
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                <span>Selling Price: ${product.sellingPrice.toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Scale className="h-4 w-4 text-muted-foreground" />
                                                <span>Category: {product.productCategory}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Truck className="h-4 w-4 text-muted-foreground" />
                                                <span>Reorder Point: {product.reorderPoint} units</span>
                                            </div>

                                            <Separator />
                                            <div>
                                                <h3 className="font-semibold">Costing</h3>
                                                <ul className="text-sm list-disc list-inside space-y-1 mt-2">
                                                    <li>Total Material Cost: ₹{product.totalMaterialCost}</li>
                                                    <li>Labor Cost: ₹{product.laborCost}</li>
                                                    <li>Machine Cost: ₹{product.machineCost}</li>
                                                    <li>Overhead Cost: ₹{product.overheadCost}</li>
                                                    <li>Total Production Cost: ₹{product.totalProductionCost}</li>
                                                    <li>Profit Margin: ₹{product.profitMargin}</li>
                                                    <li>Final Selling Price: ₹{product.finalSellingPrice}</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-semibold flex items-center gap-2">
                                                    <Settings className="h-4 w-4" />
                                                    Raw Materials Required
                                                </h3>
                                                {product.currentStock <= product.reorderPoint && (
                                                    <span className="text-xs text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Reorder Required
                                                    </span>
                                                )}
                                            </div>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Material ID</TableHead>
                                                        <TableHead className="text-right">Quantity</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {product.rawMaterials.map((material) => (
                                                        <TableRow key={material.rawMaterialId}>
                                                            <TableCell>{material.rawMaterialId}</TableCell>
                                                            <TableCell className="text-right">
                                                                {material.quantity}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>

                                            {product.semiFinishedComponents?.length > 0 && (
                                                <>
                                                    <h3 className="font-semibold mt-6 mb-2">
                                                        Semi-Finished Components
                                                    </h3>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Product ID</TableHead>
                                                                <TableHead className="text-right">Quantity</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {product.semiFinishedComponents.map((comp) => (
                                                                <TableRow key={comp.productId}>
                                                                    <TableCell>{comp.productId}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        {comp.quantity}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </>
                                            )}

                                            {product.machines?.length > 0 && (
                                                <>
                                                    <h3 className="font-semibold mt-6 mb-2">Machines Used</h3>
                                                    <ul className="text-sm space-y-1">
                                                        {product.machines.map((machine) => (
                                                            <li key={machine.machineId}>
                                                                {machine.machineId} — Cycle Time: {machine.cycleTime}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}

                                            {product.manualJobs?.length > 0 && (
                                                <>
                                                    <h3 className="font-semibold mt-6 mb-2">Manual Jobs</h3>
                                                    <ul className="text-sm space-y-1">
                                                        {product.manualJobs.map((job) => (
                                                            <li key={job.jobId}>
                                                                {job.jobId} — Time/Unit: {job.expectedTimePerUnit}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <Separator className="my-6" />
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Minimum Stock Level: {product.minimumStockLevel} units
                                        </div>
                                        <span>Product ID: {product.productId}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
