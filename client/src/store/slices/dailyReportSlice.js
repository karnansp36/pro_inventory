import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dailyReportService from '../../services/dailyReportService';

export const createDailyReport = createAsyncThunk(
  'dailyReport/create',
  async (reportData, { rejectWithValue }) => {
    try {
      return await dailyReportService.createDailyReport(reportData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getDailyReportsByBranch = createAsyncThunk(
  'dailyReport/getByBranch',
  async ({ branchId, page, limit, filters }, { rejectWithValue }) => {
    try {
      const response = await dailyReportService.getDailyReportsByBranch(branchId, page, limit, filters);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getDailyReportById = createAsyncThunk(
  'dailyReport/getById',
  async (id, { rejectWithValue }) => {
    try {
      return await dailyReportService.getDailyReportById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateDailyReport = createAsyncThunk(
  'dailyReport/update',
  async ({ id, reportData }, { rejectWithValue }) => {
    try {
      return await dailyReportService.updateDailyReport(id, reportData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteDailyReport = createAsyncThunk(
  'dailyReport/delete',
  async (id, { rejectWithValue }) => {
    try {
      await dailyReportService.deleteDailyReport(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const dailyReportSlice = createSlice({
  name: 'dailyReport',
  initialState: {
    dailyReports: [],
    currentReport: null,
    totalItems: 0,
    loading: false,
    error: null,
    currentPage: 1,
    itemsPerPage: 10,
    filters: {
      searchTerm: '',
      dateFilter: { type: 'all', startDate: '', endDate: '' }
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {
        searchTerm: '',
        dateFilter: { type: 'all', startDate: '', endDate: '' }
      };
      state.currentPage = 1;
    },
    clearCurrentReport: (state) => {
      state.currentReport = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Daily Report
      .addCase(createDailyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDailyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload) {
          state.dailyReports.unshift(action.payload);
        }
      })
      .addCase(createDailyReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Daily Reports by Branch
      .addCase(getDailyReportsByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDailyReportsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.dailyReports = action.payload.dailyReports;
          state.totalItems = action.payload.totalItems;
        } else {
          state.dailyReports = [];
          state.totalItems = 0;
        }
        state.error = null;
      })
      .addCase(getDailyReportsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Daily Report by ID
      .addCase(getDailyReportById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDailyReportById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReport = action.payload;
        state.error = null;
      })
      .addCase(getDailyReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Daily Report
      .addCase(updateDailyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDailyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload) {
          const index = state.dailyReports.findIndex(report => report._id === action.payload._id);
          if (index !== -1) {
            state.dailyReports[index] = action.payload;
          }
          if (state.currentReport && state.currentReport._id === action.payload._id) {
            state.currentReport = action.payload;
          }
        }
      })
      .addCase(updateDailyReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Daily Report
      .addCase(deleteDailyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDailyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.dailyReports = state.dailyReports.filter(report => report._id !== action.payload);
        state.currentReport = null;
      })
      .addCase(deleteDailyReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  setCurrentPage,
  setItemsPerPage,
  setFilters,
  clearFilters,
  clearCurrentReport
} = dailyReportSlice.actions;
export default dailyReportSlice.reducer;