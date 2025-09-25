const mongoose = require('mongoose');

const salesSchema = mongoose.Schema(
  {
    branchOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cash: {
      type: Number,
      required: true,
      default: 0,
    },
    gpay: {
      type: Number,
      required: true,
      default: 0,
    },
    creditCard: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
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

module.exports = Sales;