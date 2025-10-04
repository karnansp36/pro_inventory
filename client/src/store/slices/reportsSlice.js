import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as reportService from '../../services/reportService';

export const fetchSalesReport = createAsyncThunk(
  'reports/fetchSalesReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.fetchSalesReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch sales report');
    }
  }
);

export const fetchExpenseReport = createAsyncThunk(
  'reports/fetchExpenseReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.fetchExpenseReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch expense report');
    }
  }
);

export const fetchProfitLossReport = createAsyncThunk(
  'reports/fetchProfitLossReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.fetchProfitLossReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch profit/loss report');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    salesReport: null,
    expenseReport: null,
    profitLossReport: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearReports: (state) => {
      state.salesReport = null;
      state.expenseReport = null;
      state.profitLossReport = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.salesReport = action.payload;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchExpenseReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseReport.fulfilled, (state, action) => {
        state.loading = false;
        state.expenseReport = action.payload;
      })
      .addCase(fetchExpenseReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProfitLossReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfitLossReport.fulfilled, (state, action) => {
        state.loading = false;
        state.profitLossReport = action.payload;
      })
      .addCase(fetchProfitLossReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReports, clearError } = reportsSlice.actions;
export default reportsSlice.reducer;