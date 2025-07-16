import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// 🔷 Interfaces
interface DailyPlan {
    date: string;
    units: number;
    status: string;
}

interface MachineAlert {
    machineName: string;
    maxCapacity: string | number;
    availableTime: string | number;
    downtimeRisk: boolean;
}

interface RawMaterialInfo {
    name: string;
    totalNeeded: number;
    available: number;
    uom: string;
}

interface FinancialHealth {
    totalAmount: number;
    balance: number;
    paymentStatus: string;
    dueDate: string;
}

interface ProcurementItem {
    rawMaterial: string;
    rawMaterialCode: string;
    requiredBy: string;
    quantityNeeded: number;
    forOrder: string;
}

interface ProductionItem {
    orderId: string;
    productName: string;
    customerName: string;
    deliveryDate: string;
    remainingQuantity: number;
    dailyTarget: number;
    machines: MachineAlert[];
    rawMaterials: RawMaterialInfo[];
    materialAlert: boolean;
    status: string;
    dailyPlan: DailyPlan[];
    financialHealth?: FinancialHealth;
}

const ProductionPlanPage: React.FC = () => {
    const [plan, setPlan] = useState<ProductionItem[]>([]);
    const [procurement, setProcurement] = useState<ProcurementItem[]>([]);

    useEffect(() => {
        axios.get('https://neura-ops.onrender.com/api/v1/production-plan',
            {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
        )
            .then((res) => {
                setPlan(res.data.plan);
                setProcurement(res.data.materialProcurementSchedule);
            });
    }, []);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Delayed': return 'destructive';
            case 'Material Shortage': return 'secondary';
            default: return 'default';
        }
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">📅 Monthly Production & Business Plan</h1>

            {plan.map((item, index) => (
                <Card key={index} className={`shadow-md ${item.status === 'Delayed' ? 'border-red-500' : ''}`}>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold">Order #{item.orderId}</h2>
                                <p className="text-sm text-gray-600">Product: {item.productName}</p>
                                <p className="text-sm">Customer: {item.customerName}</p>
                            </div>
                            <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p><strong>Delivery Date:</strong> {format(new Date(item.deliveryDate), 'PPP')}</p>
                                <p><strong>Remaining Qty:</strong> {item.remainingQuantity}</p>
                                <p><strong>Daily Target:</strong> {item.dailyTarget} units</p>
                            </div>
                            <div>
                                <p><strong>Material Alert:</strong> <Badge variant={item.materialAlert ? 'destructive' : 'default'}>
                                    {item.materialAlert ? 'Restock Required' : 'Sufficient'}</Badge></p>
                                {item.financialHealth && (
                                    <>
                                        <p><strong>Payment Status:</strong> {item.financialHealth.paymentStatus}</p>
                                        <p><strong>Balance Due:</strong> ₹{item.financialHealth.balance.toLocaleString()}</p>
                                        <p><strong>Due Date:</strong> {format(new Date(item.financialHealth.dueDate), 'PPP')}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold">Machines</h3>
                                <ul className="list-disc pl-4">
                                    {item.machines.map((m, idx) => (
                                        <li key={idx}>
                                            {m.machineName} — Capacity: {m.maxCapacity}, Available: {m.availableTime},
                                            {m.downtimeRisk && <Badge variant="destructive">Downtime Risk</Badge>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Raw Materials</h3>
                                <ul className="list-disc pl-4">
                                    {item.rawMaterials.map((rm, idx) => (
                                        <li key={idx}>
                                            {rm.name} — Needed: {rm.totalNeeded} {rm.uom}, Available: {rm.available} {rm.uom}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>📆 Date</TableCell>
                                    <TableCell>🎯 Target</TableCell>
                                    <TableCell>🛠️ Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {item.dailyPlan.map((day, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{format(new Date(day.date), 'PPP')}</TableCell>
                                        <TableCell>{day.units} units</TableCell>
                                        <TableCell>{day.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ))}

            {procurement.length > 0 && (
                <Card className="shadow-md">
                    <CardContent className="p-4 space-y-4">
                        <h2 className="text-xl font-bold">🛒 Raw Material Procurement Schedule</h2>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Material</TableCell>
                                    <TableCell>Required By</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>For Order</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {procurement.map((p, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{p.rawMaterial}</TableCell>
                                        <TableCell>{format(new Date(p.requiredBy), 'PPP')}</TableCell>
                                        <TableCell>{p.quantityNeeded}</TableCell>
                                        <TableCell>{p.forOrder}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ProductionPlanPage;
