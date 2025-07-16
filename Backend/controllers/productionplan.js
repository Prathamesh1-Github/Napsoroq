const { StatusCodes } = require("http-status-codes");
const Order = require('../modles/Order');
const Product = require('../modles/Product');
const Machine = require('../modles/Machine');
const RawMaterial = require('../modles/RawMaterial');
const BusinessCustomer = require('../modles/BusinessCustomer');
const SalesLedger = require('../modles/SalesLedger');


const getDateRange = (start, end) => {
    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
    }
    return days;
};


const getProductionPlan = async (req, res) => {
    try {
        const companyId = req.company.companyId;
        const today = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(today.getMonth() + 1);

        // 🧾 Fetch only orders belonging to this company
        const orders = await Order.find({
            createdBy: companyId,
            status: { $in: ['In Progress', 'Partially Cancelled'] }
        }).populate('productId customerId');

        // 📦 Get current raw material stock scoped to company
        const rawMaterialStock = await RawMaterial.find({ createdBy: companyId });

        const rawMaterialUsageMap = new Map();
        const materialProcurementSchedule = [];

        const plan = await Promise.all(orders.map(async (order) => {
            const product = order.productId;
            const customer = order.customerId;

            // 🛠️ Machines used in the product
            const machines = await Machine.find({
                machineId: { $in: product.machines.map(m => m.machineId) },
                createdBy: companyId
            });

            // 🧪 Raw materials used in the product
            const rawMaterials = await RawMaterial.find({
                rawMaterialCode: { $in: product.rawMaterials.map(r => r.rawMaterialId) },
                createdBy: companyId
            });

            // 💰 Financials
            const salesLedger = await SalesLedger.findOne({
                createdBy: companyId,
                order: order._id
            });

            const deliveryDate = new Date(order.deliveryDate);
            const isDelayed = deliveryDate < today && order.remainingQuantity > 0;
            const daysLeft = Math.max(Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24)), 1);
            const dailyTarget = Math.ceil(order.remainingQuantity / daysLeft);

            const dailyPlan = getDateRange(today, deliveryDate).map((date) => ({
                date,
                units: dailyTarget,
                status: 'Scheduled'
            }));

            const requiredRawMaterials = product.rawMaterials.map(rm => {
                const raw = rawMaterials.find(x => x.rawMaterialCode === rm.rawMaterialId);
                const totalNeeded = dailyTarget * daysLeft * rm.quantity;
                const available = raw?.currentStockLevel || 0;
                const uom = raw?.purchaseUOM || 'Units';

                const existingUsage = rawMaterialUsageMap.get(rm.rawMaterialId) || 0;
                rawMaterialUsageMap.set(rm.rawMaterialId, existingUsage + totalNeeded);

                const globalAvailable = rawMaterialStock.find(r => r.rawMaterialCode === rm.rawMaterialId)?.currentStockLevel || 0;

                if ((existingUsage + totalNeeded) > globalAvailable) {
                    const daysUntilShortage = Math.ceil(globalAvailable / (rm.quantity * dailyTarget));
                    const reorderDate = new Date();
                    reorderDate.setDate(reorderDate.getDate() + daysUntilShortage - (raw?.leadTime || 0));

                    materialProcurementSchedule.push({
                        rawMaterial: raw?.rawMaterialName || rm.rawMaterialId,
                        rawMaterialCode: rm.rawMaterialId,
                        requiredBy: reorderDate,
                        quantityNeeded: totalNeeded,
                        forOrder: order._id
                    });
                }

                return {
                    name: raw?.rawMaterialName || rm.rawMaterialId,
                    totalNeeded,
                    available,
                    uom
                };
            });

            const materialAlert = requiredRawMaterials.some(r => r.available < r.totalNeeded);

            const machineAlerts = machines.map(machine => ({
                machineName: machine.machineName,
                maxCapacity: machine.maxProductionCapacity || 'N/A',
                availableTime: machine.availableMachineTime || 'N/A',
                downtimeRisk: (machine.unplannedDowntime || 0) > 5
            }));

            const financialHealth = salesLedger ? {
                totalAmount: salesLedger.totalAmount,
                balance: salesLedger.balance,
                paymentStatus: salesLedger.paymentStatus,
                dueDate: salesLedger.dueDate
            } : null;

            return {
                orderId: order._id,
                productName: product.productName,
                customerName: customer.customerName,
                deliveryDate: order.deliveryDate,
                remainingQuantity: order.remainingQuantity,
                dailyTarget,
                dailyPlan,
                machines: machineAlerts,
                rawMaterials: requiredRawMaterials,
                materialAlert,
                status: isDelayed ? 'Delayed' : materialAlert ? 'Material Shortage' : 'On Track',
                financialHealth
            };
        }));

        res.status(StatusCodes.OK).json({ plan, materialProcurementSchedule });
    } catch (error) {
        console.error("Error generating production plan:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error generating production plan."
        });
    }
};



module.exports = {
    getProductionPlan,
};
