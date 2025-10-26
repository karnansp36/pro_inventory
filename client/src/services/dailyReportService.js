import api from './api';

const dailyReportService = {
  createDailyReport: async (reportData) => {
    const res = await api.post('/daily-report', reportData);
    return res.data;
  },
  getDailyReportsByBranch: async (branchId) => {
    const res = await api.get(`/daily-report/branch/${branchId}`);
    console.log('report', res.data)

    return res.data;
  },
};

export default dailyReportService;
