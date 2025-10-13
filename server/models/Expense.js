import mongoose from 'mongoose';

const expenseSchema = mongoose.Schema(
  {
    branchOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: String,
      required: false,
      enum: ['cash', 'gpay', 'card'], // Enforce allowed payment methods
      default: 'cash',
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;