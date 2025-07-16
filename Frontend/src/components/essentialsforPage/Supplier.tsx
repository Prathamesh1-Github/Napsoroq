import { useState } from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Building2, Phone, Mail, MapPin, Package,
    Calendar, Truck, Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const paymentTermsColor = {
    "Net 30": "text-blue-500",
    "Net 60": "text-purple-500",
    "Advance Payment": "text-green-500",
    "COD": "text-orange-500",
};

const paymentTermsBg = {
    "Net 30": "bg-blue-500/10",
    "Net 60": "bg-purple-500/10",
    "Advance Payment": "bg-green-500/10",
    "COD": "bg-orange-500/10",
};

interface Supplier {
    _id: string;
    supplierName: string;
    email: string;
    gstNumber: string;
    paymentTerms: string;
    phoneNumber: string;
    address: string;
    materialsSupplied: string[];
    contactPerson: string;
    createdAt: string;
}

export function SupplierDashboard({ suppliers = [] }: { suppliers?: Supplier[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSuppliers = suppliers.filter((supplier: Supplier) =>
        supplier.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container w-screen mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Suppliers</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and view all supplier accounts
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search suppliers..."
                            className="pl-10 w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="font-semibold">
                        {suppliers.length} Total Suppliers
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredSuppliers.map((supplier: Supplier, index: number) => (
                    <motion.div
                        key={supplier._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-primary/10">
                                                {supplier.supplierName?.split(" ").map(n => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-xl">{supplier.supplierName}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <Building2 className="h-4 w-4" />
                                                GST: {supplier.gstNumber}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge
                                        className={cn(
                                            "font-medium",
                                            paymentTermsBg[supplier.paymentTerms as keyof typeof paymentTermsBg],
                                            paymentTermsColor[supplier.paymentTerms as keyof typeof paymentTermsColor]
                                        )}
                                    >
                                        {supplier.paymentTerms}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{supplier.phoneNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{supplier.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{supplier.address}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                Materials Supplied
                                            </h3>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Last updated: {new Date().toLocaleDateString()}
                                            </span>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Material</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {supplier.materialsSupplied?.length > 0 ? (
                                                    supplier.materialsSupplied.map((material: string, index: number) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="font-medium">
                                                                {material}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell className="text-center text-muted-foreground">
                                                            No materials listed.
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
                                        <Truck className="h-4 w-4" />
                                        Contact Person: {supplier.contactPerson}
                                    </div>
                                    <span>
                                        Supplier since {new Date(supplier.createdAt).toLocaleDateString()}
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