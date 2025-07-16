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
    Building2, Phone, Mail, MapPin, Receipt,
    Calendar, Package, Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Customer } from "@/types";

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

const orderFrequencyColor = {
    "Weekly": "text-emerald-500",
    "Monthly": "text-blue-500",
    "Quarterly": "text-purple-500",
    "Yearly": "text-orange-500",
};

export function BusinessCustomerDashboard({ customers = [] }: { customers?: Customer[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCustomers = customers.filter((customer: Customer) =>
        customer.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container w-screen   mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Business Customers</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and view all business customer accounts
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search customers..."
                            className="pl-10 w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="font-semibold">
                        {customers.length} Total Customers
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredCustomers.map((customer: Customer, index: number) => (
                    <motion.div
                        key={customer._id}
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
                                                {customer.customerName?.split(" ").map(n => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-xl">{customer.customerName}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <Building2 className="h-4 w-4" />
                                                GST: {customer.gstNumber}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className={cn(
                                                "font-medium",
                                                paymentTermsBg[customer.preferredPaymentTerms as keyof typeof paymentTermsBg],
                                                paymentTermsColor[customer.preferredPaymentTerms as keyof typeof paymentTermsColor]
                                            )}
                                        >
                                            {customer.preferredPaymentTerms}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "font-medium",
                                                orderFrequencyColor[customer.orderFrequency as keyof typeof orderFrequencyColor]
                                            )}
                                        >
                                            {customer.orderFrequency} Orders
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{customer.phoneNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{customer.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{customer.companyAddress}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                Products Ordered
                                            </h3>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Last updated: {new Date().toLocaleDateString()}
                                            </span>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead className="text-right">Avg. Quantity</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {customer.productsOrdered?.map((product: any) => (
                                                    <TableRow key={product.productId}>
                                                        <TableCell className="font-medium">
                                                            {product.productName}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {product.averageQuantity}
                                                        </TableCell>
                                                    </TableRow>
                                                )) || (
                                                        <TableRow>
                                                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                                                                No products ordered.
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
                                        <Receipt className="h-4 w-4" />
                                        Contact Person: {customer.contactPerson}
                                    </div>
                                    <span>
                                        Customer since {new Date(customer.createdAt).toLocaleDateString()}
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