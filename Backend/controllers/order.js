const Order = require("../modles/Order");
const { StatusCodes } = require("http-status-codes");

const Product = require("../modles/Product")
const PackagingRawMaterial = require('../modles/PackagingRawMaterial')

const SalesLedger = require("../modles/SalesLedger")
const Invoice = require("../modles/Invoice")


const mongoose = require("mongoose");


const createOrder = async (req, res) => {
    try {
        const orderData = req.body;

        // Inject company scope
        orderData.createdBy = req.company.companyId;

        // Set remaining quantity = ordered quantity
        orderData.remainingQuantity = orderData.quantityOrdered;

        // === Create the Order ===
        const order = await Order.create(orderData);

        // === Create the Sales Ledger entry ===
        const ledger = await SalesLedger.create({
            order: order._id,
            customer: order.customerId,
            totalAmount: order.totalOrderValue,
            dueDate: order.deliveryDate,
            createdBy: req.company.companyId // scope ledger as well
        });

        // === Link ledger to order ===
        order.salesLedger = ledger._id;
        await order.save();

        // === Handle Advance Payment if provided ===
        if (orderData.advancePayment?.amount) {
            await SalesLedger.findByIdAndUpdate(ledger._id, {
                $push: {
                    receivedPayments: {
                        amount: orderData.advancePayment.amount,
                        transactionId: orderData.advancePayment.transactionId,
                        date: orderData.advancePayment.date,
                        mode: orderData.advancePayment.mode
                    }
                }
            });
        }

        res.status(201).json({ success: true, order, ledger });

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(400).json({ success: false, error: error.message });
    }
};



// 🔹 Get all orders (populated with customer & product names)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({ createdBy: req.company.companyId })
            .populate("customerId", "customerName")
            .populate("productId", "productName");

        res.status(StatusCodes.OK).json({ orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching orders", error: error.message });
    }
};


const getAllOrdersAi = async (req, res) => {
    try {
        const orders = await Order.find({ createdBy: req.company.companyId })

        res.status(StatusCodes.OK).json({ orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching orders", error: error.message });
    }
};



// 🔹 Get only "In Progress" orders (populated)
const getInProgressOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            status: "In Progress",
            createdBy: req.company.companyId
        })
            .populate("customerId")
            .populate("productId", "productName");

        res.status(StatusCodes.OK).json({ orders });
    } catch (error) {
        console.error("Error fetching in-progress orders:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching in-progress orders", error: error.message });
    }
};


// 🔹 Get only "Completed" orders (populated)
const getCompletedOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            status: "Completed",
            createdBy: req.company.companyId
        })
            .populate("customerId")
            .populate("productId", "productName");

        res.status(StatusCodes.OK).json({ orders });
    } catch (error) {
        console.error("Error fetching completed orders:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching completed orders", error: error.message });
    }
};


// 🔹 Get a single order by ID (populated)
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            _id: id,
            createdBy: req.company.companyId
        })
            .populate("customerId")
            .populate("productId", "productName");

        if (!order) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
        }

        res.status(StatusCodes.OK).json({ order });
    } catch (error) {
        console.error("Error fetching order by ID:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching order by ID", error: error.message });
    }
};



// 🔹 Partially fulfill an order (deliver in shifts)
const deliverOrder = async (req, res) => {
    try {
        const { quantityDelivered } = req.body;

        const order = await Order.findOne({
            _id: req.params.id,
            createdBy: req.company.companyId
        });

        if (!order) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
        }

        order.quantityDelivered += quantityDelivered;
        order.remainingQuantity -= quantityDelivered;

        if (order.remainingQuantity <= 0) {
            order.status = "Completed";
        }

        await order.save();
        res.status(StatusCodes.OK).json({ message: "Delivery updated", order });
    } catch (error) {
        console.error("Error updating delivery:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error updating delivery", error: error.message });
    }
};


// 🔹 Mark order as completed
const completeOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            createdBy: req.company.companyId
        });

        if (!order) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
        }

        order.status = "Completed";
        order.remainingQuantity = 0;
        order.quantityDelivered = order.quantityOrdered;

        await order.save();
        res.status(StatusCodes.OK).json({ message: "Order marked as completed", order });
    } catch (error) {
        console.error("Error completing order:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error completing order", error: error.message });
    }
};



const bulkDeliverOrders = async (req, res) => {
    try {
        const { updates } = req.body;

        for (const update of updates) {
            const order = await Order.findOne({
                _id: update.id,
                createdBy: req.company.companyId
            });

            if (!order) continue;

            console.log(update);

            const deliveredQty = update.quantityDelivered;
            const newDeliveredQty = order.quantityDelivered + deliveredQty;
            const remainingQty = order.quantityOrdered - newDeliveredQty;

            // 1️⃣ Update order
            order.quantityDelivered = newDeliveredQty;
            order.remainingQuantity = remainingQty;
            order.status = remainingQty <= 0 ? "Completed" : "In Progress";
            if (remainingQty <= 0) {
                order.orderCompletionDate = new Date();
                order.remainingQuantity = 0;
            }

            // Handle payment if provided
            if (
                update.payment &&
                typeof update.payment.amount === 'number' &&
                update.payment.mode
            ) {
                order.payments.push({
                    amount: update.payment.amount,
                    date: new Date(),
                    transactionId: update.payment.transactionId,
                    mode: update.payment.mode,
                    notes: remainingQty <= 0 ? 'Final payment on delivery' : 'Partial payment'
                });
            }

            await order.save();

            // 2️⃣ Update product stock
            const product = await Product.findOne({
                _id: order.productId,
                createdBy: req.company.companyId
            });

            if (product) {
                product.currentStock -= deliveredQty;
                await product.save();
            }

            // 3️⃣ Update packaging material stock
            const packagingMaterials = await PackagingRawMaterial.find({
                "productsUsedFor.productId": order.productId,
                createdBy: req.company.companyId
            });

            for (const material of packagingMaterials) {
                const usageMapping = material.productsUsedFor.find(p =>
                    p.productId.toString() === order.productId.toString()
                );

                if (usageMapping) {
                    const totalUnitsUsed = deliveredQty / usageMapping.unitsPerPackage;
                    material.currentStockLevel -= totalUnitsUsed;
                    await material.save();
                }
            }

            // 4️⃣ Create invoice (partial or final)
            const unitPrice = order.sellingPrice;
            const deliveryCost = remainingQty <= 0 ? order.deliveryCost : 0;
            const subtotal = deliveredQty * unitPrice;
            const tax = subtotal * 0.18; // Assuming 18% GST
            const totalAmount = subtotal + tax + deliveryCost;

            const randomInvoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            await Invoice.create({
                invoiceNumber: randomInvoiceNumber,
                order: order._id,
                salesLedger: order.salesLedger,
                customer: order.customerId,
                type: remainingQty <= 0 ? 'Final' : 'Partial',
                items: [{
                    product: order.productId,
                    quantity: deliveredQty,
                    unitPrice,
                    totalPrice: subtotal
                }],
                subtotal,
                tax,
                deliveryCost,
                totalAmount,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day due date
                createdBy: req.company.companyId
            });
        }

        res.status(200).json({
            success: true,
            message: "Orders, product stock, packaging materials, and invoices updated successfully"
        });
    } catch (error) {
        console.error("Bulk delivery update failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update bulk delivery",
            error: error.message
        });
    }
};




// 🔹 Get orders by product for the current month
const getOrdersByProductCurrentMonth = async (req, res) => {
    try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        const orders = await Order.aggregate([
            {
                $match: {
                    createdBy: new mongoose.Types.ObjectId(req.company.companyId),
                    orderDate: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: "$productId",
                    totalOrders: { $sum: 1 },
                    totalQuantity: { $sum: "$quantityOrdered" },
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$quantityOrdered", "$sellingPrice"]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "products",
                    let: { productId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$productId"] },
                                createdBy: new mongoose.Types.ObjectId(req.company.companyId),
                            }
                        }
                    ],
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    productName: "$productDetails.productName",
                    totalOrders: 1,
                    totalQuantity: 1,
                    sellingPrice: {
                        $round: [
                            { $divide: ["$totalRevenue", "$totalQuantity"] },
                            2
                        ]
                    },
                    totalProductionCost: "$productDetails.totalProductionCost"
                }
            }
        ]);

        res.status(StatusCodes.OK).json({ orders });
    } catch (error) {
        console.error("Error fetching orders by product:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching orders by product",
            error: error.message
        });
    }
};



// 🔹 Get orders by customer for the current month
const getOrdersByCustomerCurrentMonth = async (req, res) => {
    try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        const orders = await Order.aggregate([
            {
                $match: {
                    createdBy: new mongoose.Types.ObjectId(req.company.companyId),
                    orderDate: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: { customerId: "$customerId", productId: "$productId" },
                    totalOrders: { $sum: 1 },
                    totalQuantity: { $sum: "$quantityOrdered" },
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$quantityOrdered", "$sellingPrice"]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "businesscustomers",
                    let: { customerId: "$_id.customerId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$customerId"] },
                                createdBy: new mongoose.Types.ObjectId(req.company.companyId),
                            }
                        }
                    ],
                    as: "customerDetails"
                }
            },
            {
                $unwind: "$customerDetails"
            },
            {
                $lookup: {
                    from: "products",
                    let: { productId: "$_id.productId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$productId"] },
                                createdBy: new mongoose.Types.ObjectId(req.company.companyId),
                            }
                        }
                    ],
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $project: {
                    _id: 0,
                    customerId: "$_id.customerId",
                    customerName: "$customerDetails.customerName",
                    productId: "$_id.productId",
                    productName: "$productDetails.productName",
                    totalOrders: 1,
                    totalQuantity: 1,
                    sellingPrice: {
                        $round: [
                            { $divide: ["$totalRevenue", "$totalQuantity"] },
                            2
                        ]
                    },
                    totalProductionCost: "$productDetails.totalProductionCost"
                }
            }
        ]);

        res.status(StatusCodes.OK).json({ orders });
    } catch (error) {
        console.error("Error fetching orders by customer:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching orders by customer",
            error: error.message
        });
    }
};



// Function to get orders by status with counts
async function getOrderStatusMetrics(req, res) {
    try {
        const companyId = new mongoose.Types.ObjectId(req.company.companyId);

        const pipeline = [
            {
                $match: { createdBy: companyId }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    orders: { $push: '$$ROOT' }
                }
            }
        ];

        const ordersByStatus = await Order.aggregate(pipeline);

        console.log(ordersByStatus)

        const inProgressOrders = ordersByStatus.find(status => status._id === 'In Progress');
        let avgProcessingTime = 0;

        if (inProgressOrders && inProgressOrders.orders.length > 0) {
            const processingTimes = inProgressOrders.orders.map(order => {
                const orderDate = new Date(order.orderDate);
                return (new Date() - orderDate) / (1000 * 60 * 60 * 24); // in days
            });

            avgProcessingTime = processingTimes.reduce((acc, time) => acc + time, 0) / processingTimes.length;
        }

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
        const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));

        const yesterdayCount = await Order.countDocuments({
            createdBy: companyId,
            orderDate: {
                $gte: startOfYesterday,
                $lt: endOfYesterday
            }
        });

        const todayCount = await Order.countDocuments({
            createdBy: companyId,
            orderDate: { $gte: startOfToday }
        });

        const percentageChange = yesterdayCount
            ? ((todayCount - yesterdayCount) / yesterdayCount) * 100
            : 0;

        res.json({
            ordersByStatus,
            metrics: {
                avgProcessingTime: avgProcessingTime.toFixed(1),
                percentageChange: percentageChange.toFixed(1)
            }
        });
    } catch (error) {
        console.error("Error in getOrderStatusMetrics:", error);
        res.status(500).json({ error: error.message });
    }
}


async function getInProgressOrderMetrics(req, res) {
    try {
        const companyId = req.company.companyId;

        const inProgressOrders = await Order.find({
            status: 'In Progress',
            createdBy: companyId
        })
            .populate('customerId', 'customerName') // optional
            .populate('productId', 'productName');  // optional

        const totalOrders = inProgressOrders.length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let totalValue = 0;
        let delayedOrders = 0;
        let onTimeDeliveries = 0;

        inProgressOrders.forEach(order => {
            const orderValue = order.remainingQuantity * order.sellingPrice;
            totalValue += orderValue;

            const deliveryDate = new Date(order.deliveryDate);
            if (deliveryDate < today) {
                delayedOrders++;
            } else {
                onTimeDeliveries++;
            }
        });

        res.json({
            totalOrders,
            totalValue,
            delayedOrders,
            onTimeDeliveries
        });
    } catch (error) {
        console.error("Error in getInProgressOrderMetrics:", error);
        res.status(500).json({ error: error.message });
    }
}




// Function to get customer insights
async function getCustomerInsights(req, res) {
    try {
        const companyId = new mongoose.Types.ObjectId(req.company.companyId);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 1️⃣ Get active customers in the last 30 days
        const activeCustomers = await Order.aggregate([
            {
                $match: {
                    createdBy: companyId,
                    orderDate: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$customerId',
                    totalOrders: { $sum: 1 },
                    totalQuantity: { $sum: '$quantityOrdered' }
                }
            }
        ]);

        // 2️⃣ Get top 3 customers based on quantity ordered
        const topCustomers = await Order.aggregate([
            { $match: { createdBy: companyId } },
            {
                $lookup: {
                    from: 'businesscustomers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $group: {
                    _id: '$customerId',
                    customerName: { $first: '$customer.customerName' },
                    totalOrders: { $sum: 1 },
                    totalQuantity: { $sum: '$quantityOrdered' }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 3 }
        ]);

        // 3️⃣ Calculate average order quantity and value
        const orderValues = await Order.aggregate([
            { $match: { createdBy: companyId } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: null,
                    avgOrderQuantity: { $avg: '$quantityOrdered' },
                    avgOrderValue: {
                        $avg: {
                            $multiply: ['$quantityOrdered', '$product.sellingPrice']
                        }
                    },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        res.json({
            activeCustomers: activeCustomers.length,
            avgOrderQuantity: orderValues[0]?.avgOrderQuantity || 0,
            avgOrderValue: orderValues[0]?.avgOrderValue || 0,
            topCustomers
        });

    } catch (error) {
        console.error("Error in getCustomerInsights:", error);
        res.status(500).json({ error: error.message });
    }
}



// Function to get sales pipeline metrics
async function getSalesPipeline(req, res) {
    try {
        const companyId = new mongoose.Types.ObjectId(req.company.companyId);

        const pipelineMetrics = await Order.aggregate([
            {
                $match: {
                    createdBy: companyId // 🎯 Filter by company
                }
            },
            {
                $lookup: {
                    from: 'products', // ✅ Ensure the collection name matches your DB
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$quantityOrdered' },
                    totalValue: {
                        $sum: {
                            $multiply: ['$quantityOrdered', '$product.sellingPrice']
                        }
                    }
                }
            }
        ]);

        const totalPipelineValue = pipelineMetrics.reduce((acc, metric) => acc + metric.totalValue, 0);

        res.json({ pipelineMetrics, totalPipelineValue });

    } catch (error) {
        console.error("Error in getSalesPipeline:", error);
        res.status(500).json({ error: error.message });
    }
}


const updateOrder = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const updated = await Order.findOneAndUpdate(
            { _id: req.params.id, createdBy: companyId }, // 🛡️ Scoped to current tenant
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Order not found or not authorized" });
        }

        res.status(200).json({ message: "Order updated", order: updated });
    } catch (err) {
        res.status(500).json({ message: "Failed to update order", error: err.message });
    }
};


const cancelOrder = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const order = await Order.findOne({
            _id: req.params.id,
            createdBy: companyId // 🛡️ Ensure company owns the order
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found or not authorized" });
        }

        order.status = "Fully Cancelled";
        await order.save();

        res.status(200).json({ message: "Order cancelled", order });
    } catch (err) {
        res.status(500).json({ message: "Failed to cancel order", error: err.message });
    }
};



const getAverageSellingPrice = async (req, res) => {
    try {
        const companyId = new mongoose.Types.ObjectId(req.company.companyId);

        const result = await Order.aggregate([
            {
                $match: {
                    createdBy: companyId // 🛡️ Tenant scoping
                }
            },
            {
                $group: {
                    _id: "$productId",
                    totalRevenue: {
                        $sum: { $multiply: ["$quantityOrdered", "$sellingPrice"] }
                    },
                    totalQuantity: { $sum: "$quantityOrdered" }
                }
            },
            {
                $project: {
                    productId: "$_id",
                    _id: 0,
                    averageSellingPrice: {
                        $cond: [
                            { $eq: ["$totalQuantity", 0] },
                            0,
                            { $divide: ["$totalRevenue", "$totalQuantity"] }
                        ]
                    }
                }
            }
        ]);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error calculating average selling price:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};


const getGrossProfitAllProductsUsingAvgSP = async (req, res) => {
    try {
        const companyId = new mongoose.Types.ObjectId(req.company.companyId);

        // Step 1: Aggregate Orders scoped to current tenant
        const avgSPs = await Order.aggregate([
            {
                $match: {
                    productId: { $ne: null },
                    createdBy: companyId
                }
            },
            {
                $group: {
                    _id: "$productId",
                    totalRevenue: { $sum: { $multiply: ["$quantityOrdered", "$sellingPrice"] } },
                    totalQuantity: { $sum: "$quantityOrdered" }
                }
            },
            {
                $project: {
                    productId: "$_id",
                    _id: 0,
                    averageSellingPrice: {
                        $cond: [
                            { $eq: ["$totalQuantity", 0] },
                            0,
                            { $divide: ["$totalRevenue", "$totalQuantity"] }
                        ]
                    }
                }
            }
        ]);

        // Step 2: Map of productId => average selling price
        const avgSPMap = {};
        avgSPs.forEach(item => {
            if (item.productId) {
                avgSPMap[item.productId.toString()] = item.averageSellingPrice;
            }
        });

        // Step 3: Fetch products created by this tenant
        const products = await Product.find({ createdBy: companyId });

        // Step 4: Compute gross profit for each product
        const result = products.map(product => {
            const productIdStr = product._id.toString();
            const avgSP = avgSPMap[productIdStr] || 0;

            const customCostTotal = (product.customCosts || []).reduce((sum, item) => {
                return sum + (item.cost || 0);
            }, 0);

            const totalProductionCost =
                (product.totalMaterialCost || 0) +
                (product.laborCost || 0) +
                (product.machineCost || 0) +
                (product.overheadCost || 0) +
                customCostTotal;

            const grossProfit = avgSP - totalProductionCost;
            const grossProfitMargin = avgSP > 0 ? ((grossProfit / avgSP) * 100).toFixed(2) : null;

            return {
                productId: product._id,
                productName: product.productName,
                averageSellingPrice: avgSP,
                totalProductionCost,
                customCosts: product.customCosts, // optional: include detailed cost breakdown
                grossProfit,
                grossProfitMargin: grossProfitMargin ? Number(grossProfitMargin) : null
            };
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error calculating gross profit using avg SP:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};


const VariableCost = require("../modles/VariableCost");
const FixedCost = require("../modles/FixedCost");

const getFinancialSummary = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // Automatically get previous month in "YYYY-MM" format
        const now = new Date();
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const monthString = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

        // Get all orders from that month for this company
        const orders = await Order.find({
            createdBy: companyId,
            orderDate: {
                $gte: new Date(`${monthString}-01`),
                $lt: new Date(`${monthString}-31`)
            }
        }).populate("productId customerId");

        const revenueByProduct = {};
        const revenueByClient = {};
        const profitByProduct = {};
        const profitByClient = {};

        let totalRevenue = 0;
        let totalCostOfGoodsSold = 0;

        for (let order of orders) {
            const revenue = order.deliveredValue || 0;
            const quantity = order.quantityDelivered || 0;
            const productCost = order.productId?.costPerUnit || 0;
            const cogs = quantity * productCost;
            const profit = revenue - cogs;

            totalRevenue += revenue;
            totalCostOfGoodsSold += cogs;

            const productName = order.productId?.productName || 'Unknown Product';
            const clientName = order.customerId?.customerName || 'Unknown Client';

            revenueByProduct[productName] = (revenueByProduct[productName] || 0) + revenue;
            profitByProduct[productName] = (profitByProduct[productName] || 0) + profit;

            revenueByClient[clientName] = (revenueByClient[clientName] || 0) + revenue;
            profitByClient[clientName] = (profitByClient[clientName] || 0) + profit;
        }

        // Get Variable and Fixed Costs scoped by companyId
        const variableCost = await VariableCost.findOne({ month: monthString, createdBy: companyId });
        const fixedCost = await FixedCost.findOne({ createdBy: companyId });

        const totalVariableCost = variableCost ? Object.values(variableCost.toObject())
            .filter(val => typeof val === "number").reduce((a, b) => a + b, 0) : 0;

        const totalFixedCost = fixedCost ? Object.values(fixedCost.toObject())
            .filter(val => typeof val === "number").reduce((a, b) => a + b, 0) : 0;

        // Breakdown of variable costs
        const rawMaterial = variableCost?.rawMaterials || 0;
        const directLabor = variableCost?.directLabor || 0;
        const manufacturingOverheads = totalVariableCost - rawMaterial - directLabor;

        // Breakdown of fixed costs
        const salaries = fixedCost?.adminSalaries || 0;
        const rent = fixedCost?.rentLeaseOfficeShopFactoryWarehouse || 0;
        const utilities = (fixedCost?.fixedElectricityCharges || 0) + (fixedCost?.waterBaseCharges || 0);
        const marketing = fixedCost?.marketingRetainers || 0;
        const financeCost = fixedCost?.loanEMIs || 0;
        const admin = totalFixedCost - (salaries + rent + utilities + marketing + financeCost);

        const ebitda = totalRevenue - totalCostOfGoodsSold - (salaries + rent + utilities + marketing + admin);
        const netProfit = totalRevenue - totalCostOfGoodsSold - totalVariableCost - totalFixedCost;

        return res.status(200).json({
            month: monthString,
            totalRevenue,
            totalCostOfGoodsSold,
            grossProfit: totalRevenue - totalCostOfGoodsSold,
            ebitda,
            netProfit,

            revenueByProduct,
            profitByProduct,
            revenueByClient,
            profitByClient,

            COGS: {
                rawMaterial,
                directLabor,
                manufacturingOverheads,
            },

            operatingExpenses: {
                salaries,
                rent,
                utilities,
                marketing,
                admin,
                financeCost
            },

            totalVariableCost,
            totalFixedCost
        });

    } catch (error) {
        console.error("Error calculating financial summary:", error);
        res.status(500).json({ error: "Failed to fetch financial summary." });
    }
};


module.exports = {
    createOrder,
    getAllOrders,
    getInProgressOrders,
    getCompletedOrders,
    deliverOrder,
    completeOrder,
    bulkDeliverOrders,
    getOrdersByProductCurrentMonth,
    getOrdersByCustomerCurrentMonth,
    getOrderStatusMetrics,
    getCustomerInsights,
    getSalesPipeline,
    getOrderById,
    getInProgressOrderMetrics,
    updateOrder,
    cancelOrder,
    getAverageSellingPrice,
    getGrossProfitAllProductsUsingAvgSP,
    getFinancialSummary,

    getAllOrdersAi
};
