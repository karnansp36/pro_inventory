import mongoose from 'mongoose';

const stockRequestSchema = mongoose.Schema(
  {
    branchOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['Urgent', 'Required', 'Normal'],
      default: 'Normal',
    },
    approved: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const StockRequest = mongoose.model('StockRequest', stockRequestSchema);

export default StockRequest;