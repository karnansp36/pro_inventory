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
    const { page = 1, limit = 10, searchTerm, dateFilterType, dateFilterStartDate, dateFilterEndDate } = req.query;

    console.log('Received query parameters:', { page, limit, searchTerm, dateFilterType, dateFilterStartDate, dateFilterEndDate });

    const query = { branchId };

    if (searchTerm) {
      query.$or = [
        { gpay: { $regex: searchTerm, $options: 'i' } },
        { card: { $regex: searchTerm, $options: 'i' } },
        { cash: { $regex: searchTerm, $options: 'i' } },
        { expenses: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    // Reconstruct dateFilter object from flattened query parameters
    const dateFilter = {
      type: dateFilterType,
      startDate: dateFilterStartDate,
      endDate: dateFilterEndDate,
    };
    console.log('Reconstructed dateFilter object:', dateFilter);

    if (dateFilter && dateFilter.type && dateFilter.type !== 'all') {
      const now = new Date();
      let startDate, endDate;

      // Helper to format date to YYYY-MM-DD string
      const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      switch (dateFilter.type) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'last7days':
          startDate = new Date(now.setDate(now.getDate() - 7));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          break;
        case 'last30days':
          startDate = new Date(now.setDate(now.getDate() - 30));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          break;
        case 'custom':
          if (dateFilter.startDate) {
            startDate = new Date(dateFilter.startDate);
            startDate.setHours(0, 0, 0, 0);
          }
          if (dateFilter.endDate) {
            endDate = new Date(dateFilter.endDate);
            endDate.setHours(23, 59, 59, 999);
          }
          break;
      }
      console.log('Calculated raw startDate:', startDate, 'raw endDate:', endDate);

      let formattedStartDate, formattedEndDate;
      if (startDate) {
        formattedStartDate = formatDate(startDate);
      }
      if (endDate) {
        formattedEndDate = formatDate(endDate);
      }
      console.log('Formatted startDate:', formattedStartDate, 'formatted endDate:', formattedEndDate);


      if (formattedStartDate && formattedEndDate) {
        query.date = { $gte: formattedStartDate, $lte: formattedEndDate };
      } else if (formattedStartDate) {
        query.date = { $gte: formattedStartDate };
      } else if (formattedEndDate) {
        query.date = { $lte: formattedEndDate };
      }
    }
    console.log('Final MongoDB query:', query);

    const totalItems = await DailyReport.countDocuments(query);
    const dailyReports = await DailyReport.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      dailyReports,
      totalItems,
      currentPage: parseInt(page),
      itemsPerPage: parseInt(limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
