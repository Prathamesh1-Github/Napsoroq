const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "BusinessCustomer", 
        required: true 
    },
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: true 
    },
    salesLedger: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "SalesLedger"
    },
    quantityOrdered: { 
        type: Number, 
        required: true 
    },
    quantityDelivered: { 
        type: Number, 
        default: 0 
    },
    remainingQuantity: { 
        type: Number, 
        required: true 
    },
    orderDate: { 
        type: Date, 
        default: Date.now 
    },
    deliveryDate: { 
        type: Date, 
        required: true 
    },
    sellingPrice: { 
        type: Number, 
        required: true 
    },
    deliveryCost: { 
        type: Number, 
        default: 0 
    },
    orderCompletionDate: { 
        type: Date 
    },
    status: { 
        type: String, 
        enum: ["In Progress", "Completed", "Partially Cancelled", "Fully Cancelled"], 
        default: "In Progress" 
    },
    // New fields for financial tracking
    advancePayment: {
        amount: { type: Number, default: 0 },
        date: { type: Date },
        transactionId: String,
        mode: {
            type: String,
            enum: ['UPI', 'NEFT', 'RTGS', 'Cash', 'Cheque'],
        }
    },
    payments: [{
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
        transactionId: String,
        mode: {
            type: String,
            enum: ['UPI', 'NEFT', 'RTGS', 'Cash', 'Cheque'],
            required: true
        },
        notes: String
    }],
    creditNotes: [{
        amount: { type: Number, required: true },
        reason: {
            type: String,
            enum: ['Cancellation', 'Return', 'Rate Difference', 'Quality Issue'],
            required: true
        },
        adjustmentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        date: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ['Pending', 'Adjusted', 'Refunded'],
            default: 'Pending'
        },
        notes: String
    }],
    rawMaterialConsumption: {
        status: {
            type: String,
            enum: ['Not Started', 'Partially Consumed', 'Fully Consumed'],
            default: 'Not Started'
        },
        consumedQuantity: { type: Number, default: 0 },
        locked: { type: Boolean, default: false }
    },
    financialStatus: {
        type: String,
        enum: [
            'Pending',
            'Advance Received',
            'Partially Paid',
            'Fully Paid',
            'Overdue',
            'Credit Note Pending'
        ],
        default: 'Pending'
    },
    paymentTerms: {
        creditPeriod: { type: Number, default: 0 }, // Days
        advanceRequired: { type: Boolean, default: false },
        advancePercentage: { type: Number, default: 0 }
    },
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual fields for financial calculations
orderSchema.virtual('totalOrderValue').get(function() {
    return (this.quantityOrdered * this.sellingPrice) + this.deliveryCost;
});

orderSchema.virtual('totalPaidAmount').get(function() {
    const advanceAmount = this.advancePayment?.amount || 0;
    const regularPayments = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
    return advanceAmount + regularPayments;
});

orderSchema.virtual('pendingAmount').get(function() {
    const totalCredits = this.creditNotes.reduce((sum, note) => {
        return sum + (note.status !== 'Adjusted' ? note.amount : 0);
    }, 0);
    return this.totalOrderValue - this.totalPaidAmount - totalCredits;
});

orderSchema.virtual('deliveredValue').get(function() {
    return this.quantityDelivered * this.sellingPrice;
});

// Pre-save middleware to update financial status
orderSchema.pre('save', function(next) {
    // Calculate financial status
    if (this.pendingAmount <= 0) {
        this.financialStatus = 'Fully Paid';
    } else if (this.advancePayment?.amount > 0) {
        this.financialStatus = 'Advance Received';
    } else if (this.totalPaidAmount > 0) {
        this.financialStatus = 'Partially Paid';
    } else if (this.creditNotes.some(note => note.status === 'Pending')) {
        this.financialStatus = 'Credit Note Pending';
    } else if (this.paymentTerms.creditPeriod > 0 && 
               new Date() > new Date(this.deliveryDate.getTime() + this.paymentTerms.creditPeriod * 24 * 60 * 60 * 1000)) {
        this.financialStatus = 'Overdue';
    }

    next();
});

module.exports = mongoose.model('Order', orderSchema);

