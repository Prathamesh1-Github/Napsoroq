import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
    ArrowLeft, 
    Save,
    Building2,
    User,
    Phone,
    Mail,
    MapPin,
    Receipt,
    CreditCard,
    Package,
    AlertCircle
} from "lucide-react";

const supplierSchema = z.object({
    supplierName: z.string().min(1, "Supplier name is required"),
    contactPerson: z.string().min(1, "Contact person is required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(1, "Address is required"),
    gstNumber: z.string().length(15, "GST number must be exactly 15 characters"),
    paymentTerms: z.string().min(1, "Payment terms are required"),
    materialsSupplied: z.array(z.string()).min(1, "At least one material must be supplied"),
});

type SupplierForm = z.infer<typeof supplierSchema>;

interface ValidationError {
    [key: string]: string[];
}

export function SupplierInputForm() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState<SupplierForm>({
        supplierName: "",
        contactPerson: "",
        phoneNumber: "",
        email: "",
        address: "",
        gstNumber: "",
        paymentTerms: "",
        materialsSupplied: [],
    });

    const [errors, setErrors] = useState<ValidationError>({});

    const validateField = (field: keyof SupplierForm, value: any) => {
        try {
            const schema = supplierSchema.shape[field];
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

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, key: keyof SupplierForm) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [key]: value }));
        validateField(key, value);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const validatedData = supplierSchema.parse(formData);
            await axios.post("https://neura-ops.onrender.com/api/v1/suppliers", validatedData,
                {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
            );
            toast({ 
                title: "Supplier saved successfully", 
                description: "Supplier data has been stored." 
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
                    title: "Error saving supplier", 
                    description: "Please try again.", 
                    variant: "destructive" 
                });
            }
        }
    };

    const renderError = (field: keyof SupplierForm) => {
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
        <div className="space-y-6 w-screen p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between bg-background p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <Building2 className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Supplier Entry</h1>
                </div>
                <Button variant="outline" onClick={() => navigate("/")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="bg-background rounded-lg shadow-sm">
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle>Supplier Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-6 p-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                Supplier Name
                            </Label>
                            <Input 
                                type="text" 
                                placeholder="Enter supplier name"
                                value={formData.supplierName} 
                                onChange={(e) => handleInputChange(e, "supplierName")} 
                            />
                            {renderError("supplierName")}
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
                                Address
                            </Label>
                            <Input 
                                type="text" 
                                placeholder="Enter complete address"
                                value={formData.address} 
                                onChange={(e) => handleInputChange(e, "address")} 
                            />
                            {renderError("address")}
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-primary" />
                                GST Number
                            </Label>
                            <Input 
                                type="text" 
                                placeholder="Enter 15-digit GST number"
                                value={formData.gstNumber} 
                                onChange={(e) => handleInputChange(e, "gstNumber")} 
                            />
                            {renderError("gstNumber")}
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-primary" />
                                Payment Terms
                            </Label>
                            <Input 
                                type="text" 
                                placeholder="Enter payment terms"
                                value={formData.paymentTerms} 
                                onChange={(e) => handleInputChange(e, "paymentTerms")} 
                            />
                            {renderError("paymentTerms")}
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                Materials Supplied
                            </Label>
                            <Input 
                                type="text" 
                                placeholder="Enter materials (comma-separated)"
                                value={formData.materialsSupplied.join(", ")} 
                                onChange={(e) => {
                                    const materials = e.target.value.split(",").map(m => m.trim()).filter(Boolean);
                                    setFormData(prev => ({ ...prev, materialsSupplied: materials }));
                                    validateField("materialsSupplied", materials);
                                }} 
                            />
                            {renderError("materialsSupplied")}
                        </div>
                    </CardContent>
                    <CardFooter className="border-t p-6 flex justify-between">
                        <Button variant="outline" onClick={() => navigate("/")}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button type="submit">
                            <Save className="mr-2 h-4 w-4" /> Save Supplier
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}

export default SupplierInputForm;