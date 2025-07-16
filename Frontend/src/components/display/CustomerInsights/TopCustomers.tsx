import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

interface Customer {
    _id: string;
    customerName: string;
    totalOrders: number;
    totalQuantity: number;
}

interface TopCustomersProps {
    onSelectCustomer: (customer: Customer) => void;
}

function TopCustomers({ onSelectCustomer }: TopCustomersProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTopCustomers = async () => {
            try {
                const response = await fetch('https://neura-ops.onrender.com/api/v1/orders/customer-insights', {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
                const data = await response.json();
                setCustomers(data.topCustomers);
            } catch (error) {
                console.error('Error fetching top customers:', error);
            }
        };

        fetchTopCustomers();
    }, []);

    return (
        <Card className='w-screen'>
            <CardHeader>
                <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total Orders</TableHead>
                            <TableHead>Total Quantity</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow
                                key={customer._id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => onSelectCustomer(customer)}
                            >
                                <TableCell>
                                    <HoverCard>
                                        <HoverCardTrigger>
                                            <span className="font-medium">{customer.customerName}</span>
                                        </HoverCardTrigger>
                                        <HoverCardContent>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold">{customer.customerName}</h4>
                                                <p className="text-sm">
                                                    Click to view detailed customer information and order history.
                                                </p>
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                </TableCell>
                                <TableCell>{customer.totalOrders}</TableCell>
                                <TableCell>{customer.totalQuantity}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Active</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default TopCustomers;