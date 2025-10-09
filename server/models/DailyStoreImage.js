import mongoose from 'mongoose';

const DailyStoreImageSchema = new mongoose.Schema({
  img: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  time: {
    type: String,
    required: true,
    default: () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('DailyStoreImage', DailyStoreImageSchema);