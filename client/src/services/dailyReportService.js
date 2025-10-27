import api from './api';

const dailyReportService = {
  createDailyReport: async (reportData) => {
    const res = await api.post('/daily-report', reportData);
    return res.data;
  },
  getDailyReportsByBranch: async (branchId, page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const res = await api.get(`/daily-report/branch/${branchId}`, { params });
    return res.data;
  },
};

export default dailyReportService;
