import mongoose from 'mongoose';

const DailyReportSchema = new mongoose.Schema({
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gpay: { type: Number, default: 0 },
  card: { type: Number, default: 0 },
  cash: { type: Number, default: 0 },
  regularExpenses: { type: Number, default: 0 },
  otherExpenses: { type: Number, default: 0 },
  date: { type: String, required: true }, // YYYY-MM-DD
}, { timestamps: true });

const DailyReport = mongoose.model('DailyReport', DailyReportSchema);
export default DailyReport;