import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Separator } from "@/components/ui/separator";
import { 
    ArrowLeft, 
    Save, 
    Trash2, 
    Package, 
    Box, 
    Warehouse, 
    ShoppingCart, 
    ClipboardCheck,
    ChevronRight,
    AlertCircle
} from 'lucide-react';

interface PackagingRawMaterialForm {
    rawMaterialName: string;
    rawMaterialCode: string;
    category: string;
    preferredSuppliers: string;
    supplierPartNumber: string;
    purchaseUOM: string;
    leadTime: number;
    minimumOrderQuantity: number;
    pricePerUnit: number;
    lastPurchasePrice: number;
    stockLocation: string;
    currentStockLevel: number;
    reorderPoint: number;
    safetyStockLevel: number;
    shelfLife: string;
    storageConditions: string;
    qualityStandards: string;
    msds: string;
    testingRequirements: boolean;
    productsUsedFor: Array<{
        productId: string;
        productName: string;
        unitsPerPackage: number;
    }>;
}

interface Product {
    _id: string;
    productName: string;
}

const formSchema = z.object({
    rawMaterialName: z.string().min(1, "Material name is required"),
    rawMaterialCode: z.string().min(1, "Material code is required"),
    category: z.string().min(1, "Category is required"),
    preferredSuppliers: z.string().min(1, "Preferred suppliers are required"),
    supplierPartNumber: z.string().min(1, "Supplier part number is required"),
    purchaseUOM: z.string().min(1, "Purchase UOM is required"),
    leadTime: z.number().min(0, "Lead time must be positive"),
    minimumOrderQuantity: z.number().min(0, "Minimum order quantity must be positive"),
    pricePerUnit: z.number().min(0, "Price per unit must be positive"),
    lastPurchasePrice: z.number().min(0, "Last purchase price must be positive"),
    stockLocation: z.string().min(1, "Stock location is required"),
    currentStockLevel: z.number().min(0, "Current stock level must be positive"),
    reorderPoint: z.number().min(0, "Reorder point must be positive"),
    safetyStockLevel: z.number().min(0, "Safety stock level must be positive"),
    shelfLife: z.string().min(1, "Shelf life is required"),
    storageConditions: z.string().min(1, "Storage conditions are required"),
    qualityStandards: z.string().min(1, "Quality standards are required"),
    msds: z.string().min(1, "MSDS information is required"),
    testingRequirements: z.boolean(),
    productsUsedFor: z.array(z.object({
        productId: z.string(),
        productName: z.string(),
        unitsPerPackage: z.number().min(1)
    }))
});

const fieldGroups = {
    materialDetails: [
        { label: "Material Name", key: "rawMaterialName", type: "string", icon: Package },
        { label: "Material Code", key: "rawMaterialCode", type: "string", icon: Box },
        { label: "Category", key: "category", type: "string", icon: Box }
    ],
    stockInformation: [
        { label: "Stock Location", key: "stockLocation", type: "string", icon: Warehouse },
        { label: "Current Stock Level", key: "currentStockLevel", type: "number", icon: Box },
        { label: "Reorder Point", key: "reorderPoint", type: "number", icon: AlertCircle },
        { label: "Safety Stock Level", key: "safetyStockLevel", type: "number", icon: Box },
        { label: "Shelf Life", key: "shelfLife", type: "string", icon: ClipboardCheck },
        { label: "Storage Conditions", key: "storageConditions", type: "string", icon: Warehouse }
    ],
    procurementDetails: [
        { label: "Preferred Suppliers", key: "preferredSuppliers", type: "string", icon: ShoppingCart },
        { label: "Supplier Part Number", key: "supplierPartNumber", type: "string", icon: Box },
        { label: "Purchase UOM", key: "purchaseUOM", type: "string", icon: Package },
        { label: "Lead Time (Days)", key: "leadTime", type: "number", icon: ClipboardCheck },
        { label: "Minimum Order Quantity", key: "minimumOrderQuantity", type: "number", icon: Box },
        { label: "Price Per Unit", key: "pricePerUnit", type: "number", icon: ShoppingCart },
        { label: "Last Purchase Price", key: "lastPurchasePrice", type: "number", icon: ShoppingCart }
    ],
    qualityDetails: [
        { label: "Quality Standards", key: "qualityStandards", type: "string", icon: ClipboardCheck },
        { label: "Testing Requirements", key: "testingRequirements", type: "boolean", icon: ClipboardCheck },
        { label: "MSDS", key: "msds", type: "string", icon: ClipboardCheck }
    ],
};

const tabIcons: { [key: string]: JSX.Element } = {
    materialDetails: <Package className="h-4 w-4" />,
    stockInformation: <Warehouse className="h-4 w-4" />,
    procurementDetails: <ShoppingCart className="h-4 w-4" />,
    qualityDetails: <ClipboardCheck className="h-4 w-4" />,
    productMapping: <Box className="h-4 w-4" />
};

export function PackagingRawMaterialForm() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("materialDetails");
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [unitsPerPackage, setUnitsPerPackage] = useState<number>(1);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rawMaterialName: '',
            rawMaterialCode: '',
            category: '',
            preferredSuppliers: '',
            supplierPartNumber: '',
            purchaseUOM: '',
            leadTime: 0,
            minimumOrderQuantity: 0,
            pricePerUnit: 0,
            lastPurchasePrice: 0,
            stockLocation: '',
            currentStockLevel: 0,
            reorderPoint: 0,
            safetyStockLevel: 0,
            shelfLife: '',
            storageConditions: '',
            qualityStandards: '',
            msds: '',
            testingRequirements: false,
            productsUsedFor: [],
        }
    });

    const { formState: { errors } } = form as any;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('https://neura-ops.onrender.com/api/v1/product', {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  });
                setProducts(response.data.products);
            } catch (error) {
                toast({
                    title: "Error fetching products",
                    description: "Could not load products. Please try again.",
                    variant: "destructive",
                });
            }
        };
        fetchProducts();
    }, [toast]);

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            await axios.post('https://neura-ops.onrender.com/api/v1/packaging-materials', data, 
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            toast({
                title: "Success!",
                description: "Packaging material has been saved successfully.",
            });
            navigate('/');
        } catch (error) {
            toast({
                title: "Error saving material",
                description: "There was a problem saving the data. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleProductAdd = () => {
        if (!selectedProduct || unitsPerPackage <= 0) return;

        const selectedProductData = products.find(p => p._id === selectedProduct);
        if (!selectedProductData) return;

        const newProduct = {
            productId: selectedProductData._id,
            productName: selectedProductData.productName,
            unitsPerPackage: unitsPerPackage
        };

        form.setValue("productsUsedFor", [...form.getValues("productsUsedFor"), newProduct]);
        setSelectedProduct('');
        setUnitsPerPackage(1);
    };

    const handleProductRemove = (index: number) => {
        const currentProducts = form.getValues("productsUsedFor");
        form.setValue("productsUsedFor", currentProducts.filter((_, i) => i !== index));
    };

    const nextTab = () => {
        const tabs = [...Object.keys(fieldGroups), "productMapping"];
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-screen container mx-auto py-8 px-4 max-w-5xl"
        >
            <div className=" flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Package className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Packaging Material Entry
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        Add new packaging material details and product mappings
                    </p>
                </div>
            </div>

            <Separator className="my-6" />

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                        {[...Object.keys(fieldGroups), "productMapping"].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                            >
                                {tabIcons[tab]}
                                <span className="hidden sm:inline">
                                    {tab.replace(/([A-Z])/g, ' $1')}
                                </span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {Object.entries(fieldGroups).map(([tabKey, fields]) => (
                                <TabsContent key={tabKey} value={tabKey}>
                                    <Card className="border-2 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                {tabIcons[tabKey]}
                                                {tabKey.replace(/([A-Z])/g, ' $1').trim()}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {fields.map(({ label, key, type, icon: Icon }) => (
                                                    <div key={key} className="space-y-2">
                                                        <Label className="flex items-center gap-2">
                                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                                            {label}
                                                            <span className="text-destructive">*</span>
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                type={type === 'boolean' ? 'checkbox' : type}
                                                                {...form.register(key as any, {
                                                                    setValueAs: (value) => {
                                                                        if (type === 'number') {
                                                                            return value === '' ? 0 : Number(value);
                                                                        }
                                                                        return value;
                                                                    }
                                                                })}
                                                                className={`transition-all focus:ring-2 focus:ring-primary/20 ${
                                                                    (errors as any)[key] ? 'border-destructive' : ''
                                                                }`}
                                                            />
                                                            {(errors as any)[key] && (
                                                                <span className="text-destructive text-sm mt-1 absolute -bottom-6 left-0">
                                                                    {(errors as any)[key]?.message}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-end pt-6">
                                            <Button
                                                type="button"
                                                onClick={nextTab}
                                                className="bg-primary hover:bg-primary/90"
                                            >
                                                Next <ChevronRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                            ))}

                            <TabsContent value="productMapping">
                                <Card className="border-2 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Box className="h-5 w-5" />
                                            Product Mapping
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Box className="h-4 w-4 text-muted-foreground" />
                                                    Select Product
                                                    <span className="text-destructive">*</span>
                                                </Label>
                                                <Select
                                                    value={selectedProduct}
                                                    onValueChange={setSelectedProduct}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose a product" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map((product) => (
                                                            <SelectItem key={product._id} value={product._id}>
                                                                {product.productName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                    Units Per Package
                                                    <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={unitsPerPackage}
                                                    onChange={(e) => setUnitsPerPackage(Number(e.target.value))}
                                                    className="transition-all focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={handleProductAdd}
                                            className="w-full bg-primary/10 hover:bg-primary/20"
                                        >
                                            <Package className="mr-2 h-4 w-4" /> Add Product Mapping
                                        </Button>

                                        {form.getValues("productsUsedFor").length > 0 && (
                                            <div className="mt-6 space-y-4">
                                                <h3 className="font-semibold flex items-center gap-2">
                                                    <ClipboardCheck className="h-4 w-4" />
                                                    Mapped Products
                                                </h3>
                                                <div className="space-y-2">
                                                    {form.getValues("productsUsedFor").map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                                <span>{item.productName} - {item.unitsPerPackage} units</span>
                                                            </div>
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                onClick={() => handleProductRemove(index)}
                                                                className="hover:bg-destructive/90"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </motion.div>
                    </AnimatePresence>
                </Tabs>

                <div className="flex justify-between items-center pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => navigate("/")}
                        className="hover:bg-secondary/80 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" /> Back
                    </Button>
                    <Button
                        type="submit"
                        size="lg"
                        className="shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
                    >
                        <Save className="mr-2 h-5 w-5" /> Save Material
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}

export default PackagingRawMaterialForm;