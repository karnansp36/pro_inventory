import mongoose from 'mongoose';

const salesSchema = mongoose.Schema(
  {
    branchOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    productName: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['gpay', 'cash', 'card'],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Sales = mongoose.model('Sales', salesSchema);

export default Sales;