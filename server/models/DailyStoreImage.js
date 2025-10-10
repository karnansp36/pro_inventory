import mongoose from 'mongoose';

const dailyStoreImageSchema = new mongoose.Schema(
  {
    branchOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
    dateTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const DailyStoreImage = mongoose.model('DailyStoreImage', dailyStoreImageSchema);
export default DailyStoreImage;
