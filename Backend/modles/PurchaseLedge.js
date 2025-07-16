const mongoose = require('mongoose');

const PurchaseLedgerSchema = new mongoose.Schema({
  purchaseRef: {
    type: String,
    required: true,
    unique: true
  },
  supplier: {
    name: {
      type: String,
      required: true
    },
    contactPerson: String,
    phone: String,
    email: String,
    gstNumber: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidPayments: [{
    amount: {
      type: Number,
      required: true
    },
    transactionId: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    mode: {
      type: String,
      enum: ['UPI', 'Bank Transfer', 'Cash', 'Cheque'],
      required: true
    },
    notes: String
  }],
  status: {
    type: String,
    enum: ['Pending', 'Partially Paid', 'Paid'],
    default: 'Pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  items: [{
    rawMaterial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterial'
    },
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
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

// Virtual field for remaining balance
PurchaseLedgerSchema.virtual('balance').get(function() {
  const totalPaid = this.paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  return this.totalAmount - totalPaid;
});

// Virtual field for payment status
PurchaseLedgerSchema.virtual('paymentStatus').get(function() {
  if (this.balance === 0) return 'Paid';
  if (this.balance === this.totalAmount) return 'Pending';
  return 'Partially Paid';
});

// Update status before saving
PurchaseLedgerSchema.pre('save', function(next) {
  this.status = this.paymentStatus;
  next();
});

module.exports = mongoose.model('PurchaseLedger', PurchaseLedgerSchema);
