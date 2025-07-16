import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { z } from "zod";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
    ArrowLeft,
    Save,
    Building2,
    Package,
    Truck,
    CreditCard,
    Ban,
} from "lucide-react";

// Schema and Types
const orderSchema = z.object({
    customerId: z.string(),
    productId: z.string(),
    quantityOrdered: z.number(),
    deliveryDate: z.string(),
    sellingPrice: z.number(),
    deliveryCost: z.number(),
    paymentTerms: z.object({
        creditPeriod: z.number(),
        advanceRequired: z.boolean(),
        advancePercentage: z.number()
    }),
    advancePayment: z.object({
        amount: z.number(),
        transactionId: z.string().optional(),
        mode: z.enum(['UPI', 'NEFT', 'RTGS', 'Cash', 'Cheque'])
    }).optional()
});

type OrderFormData = z.infer<typeof orderSchema>;

export function EditOrder() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { orderId } = useParams();
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [formData, setFormData] = useState<OrderFormData>({
        customerId: "",
        productId: "",
        quantityOrdered: 0,
        deliveryDate: "",
        sellingPrice: 0,
        deliveryCost: 0,
        paymentTerms: {
            creditPeriod: 0,
            advanceRequired: false,
            advancePercentage: 0,
        },
        advancePayment: {
            amount: 0,
            transactionId: "",
            mode: "UPI"
        }
    });
    const [activeTab, setActiveTab] = useState("basic");

    useEffect(() => {
        async function load() {
            try {
                const [custRes, prodRes, orderRes] = await Promise.all([
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
                    axios.get(`https://neura-ops.onrender.com/api/v1/orders/${orderId}`,
                        {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                    )
                ]);

                const orderData = orderRes.data.order;

                setCustomers(custRes.data.customers);
                setProducts(prodRes.data.products);

                setFormData({
                    ...orderData,
                    customerId: orderData.customerId._id,
                    productId: orderData.productId._id,
                    advancePayment: {
                        ...orderData.advancePayment,
                        transactionId: orderData.advancePayment?.transactionId || "",
                    },
                });
            } catch (err) {
                toast({ title: "Error loading data", variant: "destructive" });
            }
        }

        load();
    }, [orderId, toast]);


    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement>,
        key: keyof OrderFormData
    ) => {
        const { value, type } = e.target;
        const newValue = type === "number" ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [key]: newValue }));
    };

    const handlePaymentTermsChange = (field: keyof OrderFormData["paymentTerms"], value: any) => {
        setFormData(prev => ({
            ...prev,
            paymentTerms: {
                ...prev.paymentTerms,
                [field]: value
            }
        }));
    };

    const handleAdvancePaymentChange = (
        field: keyof NonNullable<OrderFormData["advancePayment"]>,
        value: any
    ) => {
        setFormData((prev) => ({
            ...prev,
            advancePayment: {
                ...prev.advancePayment!,
                [field]: field === "amount" ? Number(value) : value
            }
        }));
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`https://neura-ops.onrender.com/api/v1/orders/${orderId}`, formData,
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            toast({ title: "Order updated successfully" });
            navigate("/in-progressorders");
        } catch (err) {
            toast({ title: "Failed to update", variant: "destructive" });
        }
    };

    const handleCancelOrder = async () => {
        try {
            await axios.put(`https://neura-ops.onrender.com/api/v1/orders/${orderId}/cancel`,
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            toast({ title: "Order cancelled" });
            navigate("/in-progressorders");
        } catch (err) {
            toast({ title: "Cancel failed", variant: "destructive" });
        }
    };

    const calculateTotalValue = () =>
        formData.quantityOrdered * formData.sellingPrice;

    return (
        <div className="space-y-6 w-screen p-6 mx-auto">
            <div className="flex justify-between items-center p-4 rounded-lg">
                <div className="flex items-center gap-2">
                    <Package className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Edit Order</h1>
                </div>
                <Button variant="outline" onClick={() => navigate("/")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full mb-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="delivery">Delivery</TabsTrigger>
                </TabsList>

                {/* Basic Info */}
                <TabsContent value="basic">
                    <Card>
                        <CardHeader>
                            <CardTitle><Building2 className="inline mr-2" /> Order Info</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Customer</Label>
                                <Select
                                    value={formData.customerId}
                                    onValueChange={(v) => setFormData({ ...formData, customerId: v })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Customer" /></SelectTrigger>
                                    <SelectContent>
                                        {customers.map((c) => (
                                            <SelectItem key={c._id} value={c._id}>
                                                {c.customerName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Product</Label>
                                <Select
                                    value={formData.productId}
                                    onValueChange={(v) => setFormData({ ...formData, productId: v })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                                    <SelectContent>
                                        {products.map((p) => (
                                            <SelectItem key={p._id} value={p._id}>
                                                {p.productName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    value={formData.quantityOrdered}
                                    onChange={(e) => handleInputChange(e, "quantityOrdered")}
                                />
                            </div>
                            <div>
                                <Label>Delivery Date</Label>
                                <Input
                                    type="date"
                                    value={formData.deliveryDate?.slice(0, 10)}
                                    onChange={(e) => handleInputChange(e, "deliveryDate")}
                                />
                            </div>
                            <div>
                                <Label>Selling Price</Label>
                                <Input
                                    type="number"
                                    value={formData.sellingPrice}
                                    onChange={(e) => handleInputChange(e, "sellingPrice")}
                                />
                            </div>
                            <div>
                                <Label>Total Value</Label>
                                <div className="p-2 border rounded-md">₹ {calculateTotalValue()}</div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payment Terms */}
                <TabsContent value="payment">
                    <Card>
                        <CardHeader>
                            <CardTitle><CreditCard className="inline mr-2" /> Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center gap-2">
                                <Label>Advance Required</Label>
                                <Switch
                                    checked={formData.paymentTerms.advanceRequired}
                                    onCheckedChange={(val) => handlePaymentTermsChange("advanceRequired", val)}
                                />
                            </div>
                            {formData.paymentTerms.advanceRequired && (
                                <>
                                    <div>
                                        <Label>Advance %</Label>
                                        <Input
                                            type="number"
                                            value={formData.paymentTerms.advancePercentage}
                                            onChange={(e) =>
                                                handlePaymentTermsChange("advancePercentage", Number(e.target.value))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Payment Mode</Label>
                                        <Select
                                            value={formData.advancePayment?.mode}
                                            onValueChange={(v) => handleAdvancePaymentChange("mode", v)}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Mode" /></SelectTrigger>
                                            <SelectContent>
                                                {["UPI", "NEFT", "RTGS", "Cash", "Cheque"].map((mode) => (
                                                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Transaction ID</Label>
                                        <Input
                                            type="text"
                                            value={formData.advancePayment?.transactionId || ""}
                                            onChange={(e) =>
                                                handleAdvancePaymentChange("transactionId", e.target.value)
                                            }
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <Label>Credit Period (Days)</Label>
                                <Input
                                    type="number"
                                    value={formData.paymentTerms.creditPeriod}
                                    onChange={(e) =>
                                        handlePaymentTermsChange("creditPeriod", Number(e.target.value))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Delivery */}
                <TabsContent value="delivery">
                    <Card>
                        <CardHeader>
                            <CardTitle><Truck className="inline mr-2" /> Delivery</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Label>Delivery Cost</Label>
                            <Input
                                type="number"
                                value={formData.deliveryCost}
                                onChange={(e) => handleInputChange(e, "deliveryCost")}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card className="p-4 flex justify-between">
                <Button onClick={handleUpdate} className="flex items-center gap-2">
                    <Save className="h-4 w-4" /> Update Order
                </Button>
                <Button
                    variant="destructive"
                    onClick={handleCancelOrder}
                    className="flex items-center gap-2"
                >
                    <Ban className="h-4 w-4" /> Cancel Order
                </Button>
            </Card>
        </div>
    );
}
