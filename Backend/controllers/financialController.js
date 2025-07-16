const SalesLedger = require('../modles/SalesLedger');
const PurchaseLedger = require('../modles/PurchaseLedge');
const Invoice = require('../modles/Invoice');

// Sales Ledger Controllers
const createSalesLedger = async (req, res) => {
    try {
        const ledger = await SalesLedger.create({
            ...req.body,
            createdBy: req.company.companyId
        });
        res.status(201).json({ success: true, ledger });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};


const updateSalesLedger = async (req, res) => {
    try {
        const { payment } = req.body;
        const companyId = req.company.companyId;

        // Step 1: Find and validate the ledger
        const ledger = await SalesLedger.findOneAndUpdate(
            { _id: req.params.id, createdBy: companyId },
            { $push: { receivedPayments: payment } },
            { new: true, runValidators: true }
        ).populate('order');

        if (!ledger) {
            return res.status(404).json({ success: false, error: "Ledger not found or access denied" });
        }

        // Step 2: Validate and update the linked order (also scoped to company)
        const order = await Order.findOne({
            _id: ledger.order._id,
            createdBy: companyId
        });

        if (!order) {
            return res.status(404).json({ success: false, error: "Associated order not found or access denied" });
        }

        // Step 3: Push payment to order
        order.payments.push({
            amount: payment.amount,
            date: payment.date || new Date(),
            transactionId: payment.transactionId,
            mode: payment.mode,
            notes: payment.notes || ""
        });

        // Step 4: Save and trigger financial recalculation (if virtuals or pre-save hooks are used)
        await order.save();

        res.status(200).json({ success: true, ledger, order });
    } catch (error) {
        console.error("Error updating sales ledger:", error);
        res.status(400).json({ success: false, error: error.message });
    }
};



// Purchase Ledger Controllers
const createPurchaseLedger = async (req, res) => {
    try {
        const ledgerData = {
            ...req.body,
            createdBy: req.company.companyId
        };
        const ledger = await PurchaseLedger.create(ledgerData);
        res.status(201).json({ success: true, ledger });
    } catch (error) {
        console.error("Error creating purchase ledger:", error);
        res.status(400).json({ success: false, error: error.message });
    }
};

const updatePurchaseLedger = async (req, res) => {
    try {
        const ledger = await PurchaseLedger.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.company.companyId },
            { $push: { paidPayments: req.body.payment } },
            { new: true, runValidators: true }
        );

        if (!ledger) {
            return res.status(404).json({ success: false, error: "Ledger not found or access denied" });
        }

        res.status(200).json({ success: true, ledger });
    } catch (error) {
        console.error("Error updating purchase ledger:", error);
        res.status(400).json({ success: false, error: error.message });
    }
};


// Invoice Controllers
const createInvoice = async (req, res) => {
    try {
        const invoiceData = {
            ...req.body,
            createdBy: req.company.companyId
        };
        const invoice = await Invoice.create(invoiceData);
        res.status(201).json({ success: true, invoice });
    } catch (error) {
        console.error("Error creating invoice:", error);
        res.status(400).json({ success: false, error: error.message });
    }
};

const getInvoicesByOrder = async (req, res) => {
    try {
        const invoices = await Invoice.find({
            order: req.params.orderId,
            createdBy: req.company.companyId
        })
            .populate('customer')
            .populate('items.product');

        res.status(200).json({ success: true, invoices });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(400).json({ success: false, error: error.message });
    }
};


const updateInvoiceStatus = async (req, res) => {
    try {
        const invoice = await Invoice.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.company.companyId },  // secure query
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!invoice) {
            return res.status(404).json({ success: false, error: "Invoice not found or access denied" });
        }

        res.status(200).json({ success: true, invoice });
    } catch (error) {
        console.error("Error updating invoice status:", error);
        res.status(400).json({ success: false, error: error.message });
    }
};



// --- SALES LEDGER ---

const getAllSalesLedgers = async (req, res) => {
    try {
        const ledgers = await SalesLedger.find({ createdBy: req.company.companyId })
            .populate('order')
            .populate('customer');
        res.status(200).json({ success: true, ledgers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getAllSalesLedgersAi = async (req, res) => {
    try {
        const ledgers = await SalesLedger.find({ createdBy: req.company.companyId });
        res.status(200).json({ success: true, ledgers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


const getSingleSalesLedger = async (req, res) => {
    try {
        const ledger = await SalesLedger.findOne({
            _id: req.params.id,
            createdBy: req.company.companyId
        })
            .populate('order')
            .populate('customer');

        if (!ledger) {
            return res.status(404).json({ success: false, message: 'Sales ledger not found or access denied' });
        }

        res.status(200).json({ success: true, ledger });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};




const getAllActiveSalesLedgers = async (req, res) => {
    try {
        const ledgers = await SalesLedger.find({ createdBy: req.company.companyId })
            .populate({
                path: 'order',
                populate: [
                    { path: 'customerId', select: 'customerName' },
                    { path: 'productId', select: 'productName' }
                ]
            })
            .populate('customer');

        const activeLedgers = ledgers
            .map(ledger => {
                const order = ledger.order;
                const totalReceived = ledger.receivedPayments.reduce((sum, p) => sum + p.amount, 0);
                const advance = order.advancePayment?.amount || 0;
                const deliveredValue = order.quantityDelivered * order.sellingPrice;
                const creditNotes = order.creditNotes?.reduce((sum, note) => sum + (note.status !== 'Adjusted' ? note.amount : 0), 0) || 0;

                const totalOrderValue = (order.quantityOrdered * order.sellingPrice) + order.deliveryCost;
                const totalPaid = totalReceived;
                const overallBalance = totalOrderValue - totalPaid - creditNotes;
                const totalIngoOutgo = deliveredValue - (totalPaid + creditNotes);

                return {
                    ...ledger.toObject(),
                    customerName: ledger.customer?.customerName,
                    orderInfo: {
                        productName: order.productId?.productName,
                        quantityOrdered: order.quantityOrdered,
                        quantityDelivered: order.quantityDelivered,
                        deliveredValue,
                        advance,
                        totalReceived,
                        totalOrderValue,
                        creditNotes,
                        overallBalance,
                        totalIngoOutgo
                    }
                };
            })
            .filter(ledger => ledger.orderInfo.overallBalance > 0);

        res.status(200).json({ success: true, ledgers: activeLedgers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};




// --- PURCHASE LEDGER ---

const getAllPurchaseLedgers = async (req, res) => {
    try {
        const ledgers = await PurchaseLedger.find({ createdBy: req.company.companyId });
        res.status(200).json({ success: true, ledgers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


const getSinglePurchaseLedger = async (req, res) => {
    try {
        const ledger = await PurchaseLedger.findOne({
            _id: req.params.id,
            createdBy: req.company.companyId
        }).populate('items.rawMaterial');

        if (!ledger) {
            return res.status(404).json({ success: false, message: 'Purchase ledger not found or access denied' });
        }

        res.status(200).json({ success: true, ledger });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// --- INVOICES ---

const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ createdBy: req.company.companyId })
            .populate('order')
            .populate('salesLedger')
            .populate('customer')
            .populate('items.product');
        res.status(200).json({ success: true, invoices });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};



const getAllInvoicesAi = async (req, res) => {
    try {
        const invoices = await Invoice.find({ createdBy: req.company.companyId });
        res.status(200).json({ success: true, invoices });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


const getSingleInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({
            _id: req.params.id,
            createdBy: req.company.companyId
        })
            .populate('order')
            .populate('salesLedger')
            .populate('customer')
            .populate('items.product');

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found or access denied' });
        }

        res.status(200).json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};




// Export All
module.exports = {
    createSalesLedger,
    updateSalesLedger,
    getAllSalesLedgers,
    getSingleSalesLedger,

    createPurchaseLedger,
    updatePurchaseLedger,
    getAllPurchaseLedgers,
    getSinglePurchaseLedger,

    createInvoice,
    getInvoicesByOrder,
    getAllInvoices,
    getSingleInvoice,
    updateInvoiceStatus,

    getAllActiveSalesLedgers,

    getAllSalesLedgersAi,

    getAllInvoicesAi
};

