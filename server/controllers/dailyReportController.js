import DailyReport from '../models/DailyReport.js';

export const createDailyReport = async (req, res) => {
  try {
    const { branchId, gpay, card, cash, expenses, date } = req.body;
    // Only one report per branch per day
    const existingReport = await DailyReport.findOne({ branchId, date });
    if (existingReport) {
      return res.status(400).json({ message: 'Daily report for this branch and date already exists.' });
    }
  // Create new
  const report = new DailyReport({ branchId, gpay, card, cash, expenses, date });
  await report.save();
  res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDailyReportsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    console.log('getDailyReportsByBranch controller - received branchId:', branchId);
    const reports = await DailyReport.find({ branchId }).sort({ date: -1 });
    console.log('getDailyReportsByBranch controller - found reports:', reports);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
