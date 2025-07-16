import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { z } from "zod";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
    ArrowLeft, 
    Save, 
    Trash2, 
    Building2, 
    User, 
    Phone, 
    Mail, 
    MapPin, 
    Receipt, 
    Utensils, 
    Building, 
    CreditCard, 
    Calendar, 
    Clock,
    Plus,
    Package,
    ShoppingCart,
    AlertCircle
} from "lucide-react";

const businessCustomerSchema = z.object({
    customerName: z.string().min(1, "Company name is required"),
    contactPerson: z.string().min(1, "Contact person is required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    email: z.string().email("Invalid email address"),
    companyAddress: z.string().min(1, "Company address is required"),
    gstNumber: z.string().min(15, "GST number must be 15 characters").max(15),
    fssaiNumber: z.string().min(14, "FSSAI number must be 14 characters"),
    cinNumber: z.string().min(21, "CIN number must be 21 characters"),
    preferredPaymentTerms: z.string().min(1, "Payment terms are required"),
    creditOfPayment: z.string().min(1, "Credit terms are required"),
    orderFrequency: z.string().min(1, "Order frequency is required"),
    productsOrdered: z.array(z.object({
        productId: z.string(),
        productName: z.string(),
        averageQuantity: z.number().min(1, "Quantity must be at least 1")
    })).min(1, "At least one product must be selected")
});

type BusinessCustomerForm = z.infer<typeof businessCustomerSchema>;

interface ValidationError {
    [key: string]: string[];
}

export function BusinessCustomerInputForm() {
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [formData, setFormData] = useState<BusinessCustomerForm>({
        customerName: "",
        contactPerson: "",
        phoneNumber: "",
        email: "",
        companyAddress: "",
        gstNumber: "",
        fssaiNumber: "",
        cinNumber: "",
        preferredPaymentTerms: "",
        creditOfPayment: "",
        orderFrequency: "",
        productsOrdered: [],
    });

    const [errors, setErrors] = useState<ValidationError>({});
    const [activeTab, setActiveTab] = useState("customerDetails");
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [productQuantity, setProductQuantity] = useState<number>(1);

    useEffect(() => {
        async function fetchData() {
            try {
                const productRes = await axios.get("https://neura-ops.onrender.com/api/v1/product",
                    {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                );
                setProducts(productRes.data.products);
            } catch (error) {
                toast({
                    title: "Error fetching data",
                    description: "Could not load products",
                    variant: "destructive",
                });
            }
        }
        fetchData();
    }, [toast]);

    const validateField = (field: keyof BusinessCustomerForm, value: any) => {
        try {
            const schema = businessCustomerSchema.shape[field];
            schema.parse(value);
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors(prev => ({
                    ...prev,
                    [field]: error.errors.map(e => e.message)
                }));
            }
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, key: keyof BusinessCustomerForm) => {
        const { value, type } = e.target;
        const newValue = type === "number" ? (value ? Number(value) : 0) : value;
        setFormData(prev => ({
            ...prev,
            [key]: newValue
        }));
        validateField(key, newValue);
    };

    const handleProductAdd = () => {
        if (!selectedProduct) return;
        const productDetails = products.find((p) => p.productId === selectedProduct);
        const newProducts = [
            ...formData.productsOrdered,
            { 
                productId: selectedProduct, 
                productName: productDetails.productName, 
                averageQuantity: productQuantity 
            }
        ];
        setFormData(prev => ({
            ...prev,
            productsOrdered: newProducts
        }));
        validateField('productsOrdered', newProducts);
        setSelectedProduct("");
        setProductQuantity(1);
    };

    const handleProductRemove = (index: number) => {
        const newProducts = formData.productsOrdered.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            productsOrdered: newProducts
        }));
        validateField('productsOrdered', newProducts);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const validatedData = businessCustomerSchema.parse(formData);
            await axios.post("https://neura-ops.onrender.com/api/v1/businessCustomer", validatedData, {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  });
            toast({
                title: "Business Customer saved successfully",
                description: "Customer data has been stored.",
            });
            navigate("/");
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: ValidationError = {};
                error.errors.forEach(err => {
                    const path = err.path[0] as string;
                    if (!newErrors[path]) {
                        newErrors[path] = [];
                    }
                    newErrors[path].push(err.message);
                });
                setErrors(newErrors);
                toast({
                    title: "Validation Error",
                    description: "Please check the form for errors.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error saving customer",
                    description: "Please try again.",
                    variant: "destructive",
                });
            }
        }
    };

    const renderError = (field: keyof BusinessCustomerForm) => {
        if (errors[field]) {
            return (
                <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors[field][0]}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 w-screen p-6 max-w-7xl mx-auto dark">
            <div className="flex items-center justify-between bg-background p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <Building2 className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Business Customer Entry</h1>
                </div>
                <Button variant="outline" onClick={() => navigate("/")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="bg-background rounded-lg shadow-sm">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2 p-1">
                        <TabsTrigger value="customerDetails">
                            <User className="mr-2 h-4 w-4" />
                            Customer Details
                        </TabsTrigger>
                        <TabsTrigger value="orderPreferences">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Order Preferences
                        </TabsTrigger>
                    </TabsList>

                    {/* Customer Details */}
                    <TabsContent value="customerDetails">
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-6 p-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        Company Name
                                    </Label>
                                    <Input 
                                        type="text" 
                                        placeholder="Enter company name"
                                        value={formData.customerName} 
                                        onChange={(e) => handleInputChange(e, "customerName")} 
                                    />
                                    {renderError("customerName")}
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-primary" />
                                        Contact Person
                                    </Label>
                                    <Input 
                                        type="text"
                                        placeholder="Enter contact person name" 
                                        value={formData.contactPerson} 
                                        onChange={(e) => handleInputChange(e, "contactPerson")} 
                                    />
                                    {renderError("contactPerson")}
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-primary" />
                                        Phone Number
                                    </Label>
                                    <Input 
                                        type="text"
                                        placeholder="Enter phone number"
                                        value={formData.phoneNumber} 
                                        onChange={(e) => handleInputChange(e, "phoneNumber")} 
                                    />
                                    {renderError("phoneNumber")}
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-primary" />
                                        Email
                                    </Label>
                                    <Input 
                                        type="email"
                                        placeholder="Enter email address"
                                        value={formData.email} 
                                        onChange={(e) => handleInputChange(e, "email")} 
                                    />
                                    {renderError("email")}
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        Company Address
                                    </Label>
                                    <Input 
                                        type="text"
                                        placeholder="Enter complete company address"
                                        value={formData.companyAddress} 
                                        onChange={(e) => handleInputChange(e, "companyAddress")} 
                                    />
                                    {renderError("companyAddress")}
                                </div>

                                <div className="col-span-2 border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4">Registration Details</h3>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Receipt className="h-4 w-4 text-primary" />
                                        GST Number
                                    </Label>
                                    <Input 
                                        type="text"
                                        placeholder="Enter GST number"
                                        value={formData.gstNumber} 
                                        onChange={(e) => handleInputChange(e, "gstNumber")} 
                                    />
                                    {renderError("gstNumber")}
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Utensils className="h-4 w-4 text-primary" />
                                        FSSAI Number
                                    </Label>
                                    <Input 
                                        type="text"
                                        placeholder="Enter FSSAI number"
                                        value={formData.fssaiNumber} 
                                        onChange={(e) => handleInputChange(e, "fssaiNumber")} 
                                    />
                                    {renderError("fssaiNumber")}
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-primary" />
                                        CIN Number
                                    </Label>
                                    <Input 
                                        type="text"
                                        placeholder="Enter CIN number"
                                        value={formData.cinNumber} 
                                        onChange={(e) => handleInputChange(e, "cinNumber")} 
                                    />
                                    {renderError("cinNumber")}
                                </div>

                                <div className="col-span-2 border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4">Payment & Order Details</h3>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-primary" />
                                        Credit of Payment
                                    </Label>
                                    <Select 
                                        value={formData.creditOfPayment}
                                        onValueChange={(value) => {
                                            setFormData(prev => ({ ...prev, creditOfPayment: value }));
                                            validateField("creditOfPayment", value);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select credit terms" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="In Advance">In Advance</SelectItem>
                                            <SelectItem value="Within 30 Days">Within 30 Days</SelectItem>
                                            <SelectItem value="Within 60 Days">Within 60 Days</SelectItem>
                                            <SelectItem value="Custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {renderError("creditOfPayment")}
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        Preferred Payment Terms
                                    </Label>
                                    <Select 
                                        value={formData.preferredPaymentTerms}
                                        onValueChange={(value) => {
                                            setFormData(prev => ({ ...prev, preferredPaymentTerms: value }));
                                            validateField("preferredPaymentTerms", value);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment terms" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Net 30">Net 30</SelectItem>
                                            <SelectItem value="Net 60">Net 60</SelectItem>
                                            <SelectItem value="Advance Payment">Advance Payment</SelectItem>
                                            <SelectItem value="COD">Cash on Delivery</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {renderError("preferredPaymentTerms")}
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-primary" />
                                        Order Frequency
                                    </Label>
                                    <Select 
                                        value={formData.orderFrequency}
                                        onValueChange={(value) => {
                                            setFormData(prev => ({ ...prev, orderFrequency: value }));
                                            validateField("orderFrequency", value);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Daily">Daily</SelectItem>
                                            <SelectItem value="Weekly">Weekly</SelectItem>
                                            <SelectItem value="Monthly">Monthly</SelectItem>
                                            <SelectItem value="Quarterly">Quarterly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {renderError("orderFrequency")}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t p-6">
                                <Button 
                                    type="button"
                                    onClick={() => setActiveTab("orderPreferences")}
                                    className="ml-auto"
                                >
                                    Next: Order Preferences
                                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Order Preferences */}
                    <TabsContent value="orderPreferences">
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle>Product Selection</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-primary" />
                                            Select Product
                                        </Label>
                                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((product) => (
                                                    <SelectItem key={product.productId} value={product.productId}>
                                                        {product.productName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <ShoppingCart className="h-4 w-4 text-primary" />
                                            Average Order Quantity
                                        </Label>
                                        <Input 
                                            type="number"
                                            min="1"
                                            value={productQuantity} 
                                            onChange={(e) => setProductQuantity(Number(e.target.value))} 
                                        />
                                    </div>
                                </div>
                                
                                <Button 
                                    type="button" 
                                    onClick={handleProductAdd}
                                    className="w-full"
                                    disabled={!selectedProduct}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Product to Order
                                </Button>

                                {formData.productsOrdered.length > 0 && (
                                    <div className="mt-6 p-4 border rounded-lg">
                                        <h2 className="font-semibold mb-4 flex items-center gap-2">
                                            <Package className="h-4 w-4 text-primary" />
                                            Selected Products
                                        </h2>
                                        <div className="space-y-3">
                                            {formData.productsOrdered.map((product, index) => (
                                                <div key={index} className="flex justify-between items-center p-3 bg-card border rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4" />
                                                        <span className="font-medium">{product.productName}</span>
                                                        <span className="text-muted-foreground">- {product.averageQuantity} units</span>
                                                    </div>
                                                    <Button 
                                                        size="icon" 
                                                        variant="destructive" 
                                                        onClick={() => handleProductRemove(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        {renderError("productsOrdered")}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="border-t p-6 flex justify-between">
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab("customerDetails")}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Details
                                </Button>
                                <Button 
                                    type="submit"
                                    variant="default"
                                >
                                    <Save className="mr-2 h-4 w-4" /> 
                                    Save Customer
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    );
}

export default BusinessCustomerInputForm;