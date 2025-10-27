import mongoose from 'mongoose';

const transportSchema = mongoose.Schema(
  {
    stockRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockRequest',
      required: true,
    },
    bundleSize: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    receivedQuantity: {
      type: Number,
      required: false,
    },
    complaints: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Transport = mongoose.model('Transport', transportSchema);

export default Transport;