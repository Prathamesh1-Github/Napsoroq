import { useState } from 'react';
import CustomerSummary from './CustomerSummary';
import TopCustomers from './TopCustomers';
import CustomerDetail from './CustomerDetail';
import ChurnRetention from './ChurnRetention';

interface Customer {
    _id: string;
    customerName: string;
    totalOrders: number;
    totalQuantity: number;
}

function CustomerInsights() {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    return (
        <div className="min-h-screen w-screen bg-background">
            <header className="border-b">
                <div className="container flex h-16 items-center">
                    <h1 className="text-2xl font-bold">Customer Insights</h1>
                </div>
            </header>

            <main className="container py-6 space-y-6">
                {/* <div className="grid gap-6 md:grid-cols-2">
                    <CustomerSummary />
                    <TopCustomers onSelectCustomer={setSelectedCustomer} />
                    {selectedCustomer && <CustomerDetail customer={selectedCustomer} />}
                    <ChurnRetention />
                </div> */}
                <div>
                    <CustomerSummary />
                </div>
                <div>
                    <TopCustomers onSelectCustomer={setSelectedCustomer} />
                    {selectedCustomer && <CustomerDetail customer={selectedCustomer} />}
                </div>
                <div>
                    <ChurnRetention />
                </div>
            </main>
        </div>
    );
}

export default CustomerInsights;