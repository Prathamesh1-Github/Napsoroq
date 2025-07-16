import { useState } from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Package, Search, AlertTriangle, Archive, Truck,
    Calendar, Thermometer, Clock, DollarSign
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const categoryColors = {
    "Chemicals": "text-purple-500",
    "Metals": "text-blue-500",
    "Plastics": "text-green-500",
    "Textiles": "text-orange-500",
    "Electronics": "text-red-500",
};

const categoryBg = {
    "Chemicals": "bg-purple-500/10",
    "Metals": "bg-blue-500/10",
    "Plastics": "bg-green-500/10",
    "Textiles": "bg-orange-500/10",
    "Electronics": "bg-red-500/10",
};

interface RawMaterial {
    _id: string;
    rawMaterialName: string;
    rawMaterialCode: string;
    category: string;
    preferredSuppliers: string[];
    purchaseUOM: string;
    leadTime: number;
    currentStockLevel: number;
    safetyStockLevel: number;
    reorderPoint: number;
    pricePerUnit: number;
    stockLocation: string;
    storageConditions: string;
    qualityStandards: string[];
    createdAt: string;
}

export function RawMaterialDashboard({ materials = [] }: { materials: RawMaterial[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredMaterials = materials.filter((material) =>
        material.rawMaterialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.rawMaterialCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getLowStockStatus = (current: number, safety: number) => {
        return current <= safety ? "Low Stock" : "In Stock";
    };

    return (
        <div className="container w-screen mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Raw Materials Inventory</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor and manage raw material stock levels and details
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search materials..."
                            className="pl-10 w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="font-semibold">
                        {materials.length} Total Materials
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredMaterials.map((material: RawMaterial, index: number) => (
                    <motion.div
                        key={material._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            {material.rawMaterialName}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Code: {material.rawMaterialCode}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className={cn(
                                                "font-medium",
                                                categoryBg[material.category as keyof typeof categoryBg],
                                                categoryColors[material.category as keyof typeof categoryColors]
                                            )}
                                        >
                                            {material.category}
                                        </Badge>
                                        <Badge
                                            variant={material.currentStockLevel <= material.safetyStockLevel ? "destructive" : "outline"}
                                            className="font-medium"
                                        >
                                            {getLowStockStatus(material.currentStockLevel, material.safetyStockLevel)}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Archive className="h-4 w-4 text-muted-foreground" />
                                                <span>Current Stock: {material.currentStockLevel} {material.purchaseUOM}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                                <span>Safety Stock: {material.safetyStockLevel} {material.purchaseUOM}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>Lead Time: {material.leadTime} days</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                <span>Price: ${material.pricePerUnit}/{material.purchaseUOM}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Truck className="h-4 w-4 text-muted-foreground" />
                                            <span>Preferred Suppliers: {material.preferredSuppliers.join(", ")}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Thermometer className="h-4 w-4 text-muted-foreground" />
                                            <span>Storage: {material.storageConditions}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold">Quality Standards</h3>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Last updated: {new Date(material.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Standard</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {material.qualityStandards?.map((standard) => (
                                                    <TableRow key={standard}>
                                                        <TableCell className="font-medium">{standard}</TableCell>
                                                    </TableRow>
                                                )) || (
                                                        <TableRow>
                                                            <TableCell className="text-center text-muted-foreground">
                                                                No quality standards specified.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Location: {material.stockLocation}
                                    </div>
                                    <span>
                                        Added on {new Date(material.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}