const mongoose = require('mongoose');

const SalesLedgerSchema = new mongoose.Schema({
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BusinessCustomer', 
    required: true 
  },
  totalAmount: {
    type: Number,
    required: true
  },
  receivedPayments: [{
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
SalesLedgerSchema.virtual('balance').get(function() {
  const totalReceived = this.receivedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  return this.totalAmount - totalReceived;
});

// Virtual field for payment status
SalesLedgerSchema.virtual('paymentStatus').get(function() {
  if (this.balance === 0) return 'Paid';
  if (this.balance === this.totalAmount) return 'Pending';
  return 'Partially Paid';
});

// Update status before saving
SalesLedgerSchema.pre('save', function(next) {
  this.status = this.paymentStatus;
  next();
});

module.exports = mongoose.model('SalesLedger', SalesLedgerSchema);
