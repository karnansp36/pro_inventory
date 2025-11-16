import mongoose from 'mongoose';

const productPaymentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    numberOfPieces: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDone: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    remainingBalance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Partial', 'Completed'],
      default: 'Pending',
    },
    dueDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate remaining balance before saving
productPaymentSchema.pre('save', function(next) {
  this.remainingBalance = this.totalAmount - this.paymentDone;
  
  // Update status based on payment
  if (this.paymentDone === 0) {
    this.status = 'Pending';
  } else if (this.paymentDone < this.totalAmount) {
    this.status = 'Partial';
  } else {
    this.status = 'Completed';
  }
  
  next();
});

const ProductPayment = mongoose.model('ProductPayment', productPaymentSchema);

export default ProductPayment;