const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    salesLedger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalesLedger',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessCustomer',
        required: true
    },
    type: {
        type: String,
        enum: ['Partial', 'Final'],
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        unitPrice: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    deliveryCost: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Issued', 'Paid', 'Cancelled'],
        default: 'Draft'
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    notes: String,
    termsAndConditions: String,
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        }
}, { timestamps: true });

// Generate invoice number before saving
InvoiceSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('Invoice').countDocuments();
        this.invoiceNumber = `INV-${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
