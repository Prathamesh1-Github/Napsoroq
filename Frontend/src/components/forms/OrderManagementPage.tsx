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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Building2, Package, IndianRupee, Truck, CreditCard, AlertCircle, ChevronRight, Ban as Bank } from "lucide-react";

// Zod schema for order validation
const orderSchema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    productId: z.string().min(1, "Product is required"),
    quantityOrdered: z.number().min(1, "Quantity must be at least 1"),
    
    deliveryDate: z.string().min(1, "Delivery date is required"),
    sellingPrice: z.number().min(1, "Selling price must be greater than 0"),
    deliveryCost: z.number(),
    paymentTerms: z.object({
        creditPeriod: z.number().min(0),
        advanceRequired: z.boolean(),
        advancePercentage: z.number().min(0).max(100)
    }),
    advancePayment: z.object({
        amount: z.number(),
        transactionId: z.string().optional(),
        mode: z.enum(['UPI', 'NEFT', 'RTGS', 'Cash', 'Cheque'])
    }).optional()
});

type OrderFormData = z.infer<typeof orderSchema> & {
    quantityDelivered?: number;
    remainingQuantity?: number;
    orderDate?: string;
    status?: string;
};
type ValidationErrors = { [key: string]: string[] };

export function OrderManagementPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("basic");
    const [errors, setErrors] = useState<ValidationErrors>({});
    
    const [formData, setFormData] = useState<OrderFormData>({
        customerId: "",
        productId: "",
        quantityOrdered: 0,
        quantityDelivered: 0,
        remainingQuantity: 0,
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: "",
        status: "In Progress",
        sellingPrice: 0,
        deliveryCost: 0,
        paymentTerms: {
            creditPeriod: 0,
            advanceRequired: false,
            advancePercentage: 0
        },
        advancePayment: {
            amount: 0,
            mode: "UPI",
            transactionId: ""
        }
    });

    const [isDeliveryByUs, setIsDeliveryByUs] = useState<"Yes" | "No">("No");
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [customerRes, productRes] = await Promise.all([
                    axios.get("https://neura-ops.onrender.com/api/v1/businessCustomer", 
                        {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                    ),
                    axios.get("https://neura-ops.onrender.com/api/v1/product", 
                        {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                    ),
                ]);
                setCustomers(customerRes.data.customers);
                setProducts(productRes.data.products);
            } catch (error) {
                toast({
                    title: "Error fetching data",
                    description: "Could not load data",
                    variant: "destructive",
                });
            }
        }
        fetchData();
    }, [toast]);

    const validateField = (field: keyof OrderFormData, value: any) => {
        if (field in orderSchema.shape) {
            try {
                const schema = orderSchema.shape[field as keyof typeof orderSchema.shape];
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
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, key: keyof OrderFormData) => {
        const { value, type } = e.target;
        const newValue = type === "number" ? (value ? Number(value) : 0) : value;
        setFormData(prev => ({
            ...prev,
            [key]: newValue,
            remainingQuantity: key === "quantityOrdered" ? Number(value) : prev.remainingQuantity,
        }));
        validateField(key, newValue);
    };

    const handlePaymentTermsChange = (field: keyof typeof formData.paymentTerms, value: number | boolean) => {
        const newPaymentTerms = {
            ...formData.paymentTerms,
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            paymentTerms: newPaymentTerms
        }));
        validateField('paymentTerms', newPaymentTerms);
    };

    const handleAdvancePaymentChange = (
  field: keyof NonNullable<OrderFormData['advancePayment']>,
  value: string
) => {
  setFormData(prev => ({
    ...prev,
    advancePayment: {
      ...prev.advancePayment,
      [field]: field === 'amount' ? Number(value) : value,
      amount: field === 'amount'
        ? Number(value)
        : (typeof prev.advancePayment?.amount === 'number' ? prev.advancePayment.amount : 0),
      mode: field === 'mode'
        ? (value as "UPI" | "NEFT" | "RTGS" | "Cash" | "Cheque")
        : (prev.advancePayment?.mode ?? "UPI")
    }
  }));
};

    const calculateTotalValue = () => {
        return formData.quantityOrdered * formData.sellingPrice;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            // Only send properties defined in the schema
            const submitData = {
                customerId: formData.customerId,
                productId: formData.productId,
                quantityOrdered: formData.quantityOrdered,
                deliveryDate: formData.deliveryDate,
                sellingPrice: formData.sellingPrice,
                deliveryCost: formData.deliveryCost,
                paymentTerms: formData.paymentTerms,
                advancePayment: formData.advancePayment,
            };
            const validatedData = orderSchema.parse(submitData);
            
            if (formData.paymentTerms.advanceRequired && formData.paymentTerms.advancePercentage > 0) {
                const totalValue = calculateTotalValue();
                const advanceAmount = (totalValue * formData.paymentTerms.advancePercentage) / 100;
                validatedData.advancePayment = {
                    ...formData.advancePayment!,
                    amount: advanceAmount
                };
            }

            await axios.post("https://neura-ops.onrender.com/api/v1/orders", validatedData, {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  });
            toast({ 
                title: "Success!", 
                description: "Order has been created successfully.",
            });
            navigate("/");
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: ValidationErrors = {};
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
                    title: "Error",
                    description: "Failed to create order. Please try again.",
                    variant: "destructive",
                });
            }
        }
    };

    const renderError = (field: string) => {
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

    const renderRequiredAsterisk = () => (
        <span className="text-red-500 ml-1">*</span>
    );

    return (
        <div className="space-y-6 w-screen p-6mx-auto">
            <div className="flex items-center justify-between   p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <Package className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">New Order</h1>
                </div>
                <Button variant="outline" onClick={() => navigate("/")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="basic" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Basic Details
                        </TabsTrigger>
                        <TabsTrigger value="payment" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Terms
                        </TabsTrigger>
                        <TabsTrigger value="delivery" className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Delivery Details
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Order Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center">
                                        Customer {renderRequiredAsterisk()}
                                    </Label>
                                    <Select 
                                        value={formData.customerId}
                                        onValueChange={(value) => {
                                            setFormData(prev => ({ ...prev, customerId: value }));
                                            validateField("customerId", value);
                                        }}
                                    >
                                        <SelectTrigger className={errors.customerId ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Select customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer._id} value={customer._id}>
                                                    {customer.customerName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {renderError("customerId")}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center">
                                        Product {renderRequiredAsterisk()}
                                    </Label>
                                    <Select 
                                        value={formData.productId}
                                        onValueChange={(value) => {
                                            setFormData(prev => ({ ...prev, productId: value }));
                                            validateField("productId", value);
                                        }}
                                    >
                                        <SelectTrigger className={errors.productId ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((product) => (
                                                <SelectItem key={product._id} value={product._id}>
                                                    {product.productName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {renderError("productId")}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center">
                                        Quantity {renderRequiredAsterisk()}
                                    </Label>
                                    <Input 
                                        type="number"
                                        min="1"
                                        placeholder="Enter quantity"
                                        value={formData.quantityOrdered || ''} 
                                        onChange={(e) => handleInputChange(e, "quantityOrdered")}
                                        className={errors.quantityOrdered ? "border-red-500" : ""}
                                    />
                                    {renderError("quantityOrdered")}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center">
                                        Delivery Date {renderRequiredAsterisk()}
                                    </Label>
                                    <Input 
                                        type="date"
                                        value={formData.deliveryDate} 
                                        onChange={(e) => handleInputChange(e, "deliveryDate")}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={errors.deliveryDate ? "border-red-500" : ""}
                                    />
                                    {renderError("deliveryDate")}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center">
                                        Selling Price (per unit) {renderRequiredAsterisk()}
                                    </Label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="0.00"
                                            value={formData.sellingPrice || ''} 
                                            onChange={(e) => handleInputChange(e, "sellingPrice")}
                                            className={`pl-9 ${errors.sellingPrice ? "border-red-500" : ""}`}
                                        />
                                    </div>
                                    {renderError("sellingPrice")}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center">Total Value</Label>
                                    <div className="flex items-center space-x-2 h-10 px-3 border rounded-md   ">
                                        <IndianRupee className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">{calculateTotalValue().toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t p-6">
                                <Button 
                                    type="button"
                                    onClick={() => setActiveTab("payment")}
                                    className="flex items-center gap-2"
                                >
                                    Next: Payment Terms
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payment">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bank className="h-5 w-5 text-primary" />
                                    Payment Terms
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Bank className="h-5 w-5 text-primary" />
                                        <Label>Advance Payment Received ?</Label>
                                    </div>
                                    <Switch
                                        className="ml-20"
                                        checked={formData.paymentTerms.advanceRequired}
                                        onCheckedChange={(checked) => handlePaymentTermsChange('advanceRequired', checked)}
                                    />
                                </div>

                                {formData.paymentTerms.advanceRequired && (
                                    <div className="space-y-4 p-4 border rounded-lg">
                                        <div className="space-y-2">
                                            <Label>Advance Percentage {renderRequiredAsterisk()}</Label>
                                            <Input
                                                type="number"
                                                value={formData.paymentTerms.advancePercentage || ''}
                                                onChange={(e) => handlePaymentTermsChange('advancePercentage', Number(e.target.value))}
                                                min="0"
                                                max="100"
                                                placeholder="Enter percentage"
                                                className={errors['paymentTerms.advancePercentage'] ? "border-red-500" : ""}
                                            />
                                            {renderError('paymentTerms.advancePercentage')}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Payment Mode {renderRequiredAsterisk()}</Label>
                                            <Select 
                                                value={formData.advancePayment?.mode}
                                                onValueChange={(value: 'UPI' | 'NEFT' | 'RTGS' | 'Cash' | 'Cheque') => 
                                                    handleAdvancePaymentChange('mode', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select payment mode" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="UPI">UPI</SelectItem>
                                                    <SelectItem value="NEFT">NEFT</SelectItem>
                                                    <SelectItem value="RTGS">RTGS</SelectItem>
                                                    <SelectItem value="Cash">Cash</SelectItem>
                                                    <SelectItem value="Cheque">Cheque</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Transaction ID</Label>
                                            <Input
                                                type="text"
                                                placeholder="Enter transaction ID"
                                                onChange={(e) => handleAdvancePaymentChange('transactionId', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* <div className="space-y-2">
                                    <Label>Credit Period (Days)</Label>
                                    <Input
                                        type="number"
                                        value={formData.paymentTerms.creditPeriod || ''}
                                        onChange={(e) => handlePaymentTermsChange('creditPeriod', Number(e.target.value))}
                                        min="0"
                                        placeholder="Enter credit period"
                                    />
                                </div> */}
                            </CardContent>
                            <CardFooter className="flex justify-between border-t p-6">
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab("basic")}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back: Basic Details
                                </Button>
                                <Button 
                                    type="button"
                                    onClick={() => setActiveTab("delivery")}
                                    className="flex items-center gap-2"
                                >
                                    Next: Delivery Details
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="delivery">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-primary" />
                                    Delivery Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Is Delivery By Us?</Label>
                                    <Select value={isDeliveryByUs} onValueChange={(value: "Yes" | "No") => setIsDeliveryByUs(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Yes">Yes</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {isDeliveryByUs === "Yes" && (
                                    <div className="space-y-2">
                                        <Label>Delivery Cost</Label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input
                                                type="number"
                                                value={formData.deliveryCost || ''}
                                                onChange={(e) => handleInputChange(e, "deliveryCost")}
                                                className="pl-9"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between border-t p-6">
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab("payment")}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back: Payment Terms
                                </Button>
                                <Button 
                                    type="submit"
                                    className="flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    Create Order
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    );
}

export default OrderManagementPage