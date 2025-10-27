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

const dailyReportSlice = createSlice({
  name: 'dailyReport',
  initialState: {
    dailyReports: [],
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
    // Add a reducer to clear errors
    clearError: (state) => {
      state.error = null;
    },
    // Add a reducer to manually set reports (for debugging)
    setDailyReports: (state, action) => {
      state.dailyReports = action.payload;
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
      state.currentPage = 1; // Reset to first page when items per page changes
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {
        searchTerm: '',
        dateFilter: { type: 'all', startDate: '', endDate: '' }
      };
      state.currentPage = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDailyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDailyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Add the new report to the list
        if (action.payload) {
          state.dailyReports.unshift(action.payload);
        }
      })
      .addCase(createDailyReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
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
      });
  }
});

export const {
  clearError,
  setDailyReports,
  setCurrentPage,
  setItemsPerPage,
  setFilters,
  clearFilters
} = dailyReportSlice.actions;
export default dailyReportSlice.reducer;