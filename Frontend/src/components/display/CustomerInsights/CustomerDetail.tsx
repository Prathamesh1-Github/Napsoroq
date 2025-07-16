import { useState, useEffect } from 'react';
import { Phone, Mail, Building, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CustomerDetailProps {
    customer: {
        _id: string;
        customerName: string;
    };
}

interface CustomerDetails {
    customerName: string;
    contactPerson: string;
    phoneNumber: string;
    email: string;
    companyAddress: string;
    gstNumber: string;
    preferredPaymentTerms: string;
    orderFrequency: string;
}

function CustomerDetail({ customer }: CustomerDetailProps) {
    const [details, setDetails] = useState<CustomerDetails | null>(null);
    const [orderHistory, setOrderHistory] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchCustomerDetails = async () => {
            try {
                const response = await fetch(`https://neura-ops.onrender.com/api/v1/customers/${customer._id}`, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
                const data = await response.json();
                setDetails(data);

                const ordersResponse = await fetch(`https://neura-ops.onrender.com/api/v1/orders/customer/${customer._id}`, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
                const ordersData = await ordersResponse.json();
                setOrderHistory(ordersData);
            } catch (error) {
                console.error('Error fetching customer details:', error);
            }
        };

        if (customer._id) {
            fetchCustomerDetails();
        }
    }, [customer._id]);

    if (!details) return <div>Loading...</div>;

    return (
        <Card className="col-span-2 mt-8 w-screen">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Customer Profile</CardTitle>
                <Avatar className="h-9 w-9">
                    <AvatarFallback>
                        {details.customerName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                </Avatar>   
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="details" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <Building className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium leading-none">Company</p>
                                            <p className="text-sm text-muted-foreground">{details.customerName}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center space-x-4">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium leading-none">Phone</p>
                                            <p className="text-sm text-muted-foreground">{details.phoneNumber}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center space-x-4">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium leading-none">Email</p>
                                            <p className="text-sm text-muted-foreground">{details.email}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center space-x-4">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium leading-none">GST Number</p>
                                            <p className="text-sm text-muted-foreground">{details.gstNumber}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Business Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium">Payment Terms</p>
                                            <p className="text-sm text-muted-foreground">{details.preferredPaymentTerms}</p>
                                        </div>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium">Order Frequency</p>
                                            <p className="text-sm text-muted-foreground">{details.orderFrequency}</p>
                                        </div>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium">Address</p>
                                            <p className="text-sm text-muted-foreground">{details.companyAddress}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px]">
                                    <div className="space-y-4">
                                        {orderHistory.map((order: any) => (
                                            <Card key={order._id}>
                                                <CardContent className="pt-6">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-sm font-medium">Order #{order._id.slice(-4)}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {new Date(order.orderDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium">Quantity</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {order.quantityOrdered}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

export default CustomerDetail;