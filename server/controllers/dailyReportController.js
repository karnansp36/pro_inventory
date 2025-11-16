import DailyReport from '../models/DailyReport.js';

export const createDailyReport = async (req, res) => {
  try {
    const { branchId, gpay, card, cash, regularExpenses, otherExpenses, date } = req.body;
    // Only one report per branch per day
    const existingReport = await DailyReport.findOne({ branchId, date });
    if (existingReport) {
      return res.status(400).json({ message: 'Daily report for this branch and date already exists.' });
    }
    // Create new
    const report = new DailyReport({ branchId, gpay, card, cash, regularExpenses, otherExpenses, date });
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
        { regularExpenses: { $regex: searchTerm, $options: 'i' } },
        { otherExpenses: { $regex: searchTerm, $options: 'i' } },
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

// @desc    Update daily report
// @route   PUT /api/daily-report/:id
// @access  Private (Admin, Manager, BranchOwner)
export const updateDailyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { gpay, card, cash, regularExpenses, otherExpenses, date } = req.body;

    // Find the report
    const report = await DailyReport.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Daily report not found.' });
    }

    // Check if user has permission to update this report
    // Admin can update any report
    // Manager can update reports for their assigned branches
    // BranchOwner can only update their own reports
    const user = req.user;
    
    if (user.role === 'Manager') {
      // Check if the manager has access to this branch
      const managerBranches = await User.find({ assignedManager: user._id }).select('_id');
      const branchIds = managerBranches.map(branch => branch._id.toString());
      
      if (!branchIds.includes(report.branchId.toString())) {
        return res.status(403).json({ message: 'Not authorized to update this report.' });
      }
    } else if (user.role === 'BranchOwner') {
      // BranchOwner can only update their own reports
      if (report.branchId.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this report.' });
      }
    }

    // Check if date is being changed and if it conflicts with existing report
    if (date && date !== report.date) {
      const existingReport = await DailyReport.findOne({
        branchId: report.branchId,
        date,
        _id: { $ne: id }
      });
      
      if (existingReport) {
        return res.status(400).json({ message: 'Daily report for this branch and date already exists.' });
      }
    }

    // Update the report
    const updatedReport = await DailyReport.findByIdAndUpdate(
      id,
      {
        gpay: gpay !== undefined ? gpay : report.gpay,
        card: card !== undefined ? card : report.card,
        cash: cash !== undefined ? cash : report.cash,
        regularExpenses: regularExpenses !== undefined ? regularExpenses : report.regularExpenses,
        otherExpenses: otherExpenses !== undefined ? otherExpenses : report.otherExpenses,
        date: date || report.date,
      },
      { new: true, runValidators: true }
    );

    res.json(updatedReport);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete daily report
// @route   DELETE /api/daily-report/:id
// @access  Private (Admin, Manager, BranchOwner)
export const deleteDailyReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the report
    const report = await DailyReport.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Daily report not found.' });
    }

    // Check if user has permission to delete this report
    const user = req.user;
    
    if (user.role === 'Manager') {
      // Check if the manager has access to this branch
      const managerBranches = await User.find({ assignedManager: user._id }).select('_id');
      const branchIds = managerBranches.map(branch => branch._id.toString());
      
      if (!branchIds.includes(report.branchId.toString())) {
        return res.status(403).json({ message: 'Not authorized to delete this report.' });
      }
    } else if (user.role === 'BranchOwner') {
      // BranchOwner can only delete their own reports
      if (report.branchId.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this report.' });
      }
    }

    // Delete the report
    await DailyReport.findByIdAndDelete(id);

    res.json({ message: 'Daily report deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get daily report by ID
// @route   GET /api/daily-report/:id
// @access  Private (Admin, Manager, BranchOwner)
export const getDailyReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await DailyReport.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Daily report not found.' });
    }

    // Check if user has permission to view this report
    const user = req.user;
    
    if (user.role === 'Manager') {
      // Check if the manager has access to this branch
      const managerBranches = await User.find({ assignedManager: user._id }).select('_id');
      const branchIds = managerBranches.map(branch => branch._id.toString());
      
      if (!branchIds.includes(report.branchId.toString())) {
        return res.status(403).json({ message: 'Not authorized to view this report.' });
      }
    } else if (user.role === 'BranchOwner') {
      // BranchOwner can only view their own reports
      if (report.branchId.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this report.' });
      }
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};