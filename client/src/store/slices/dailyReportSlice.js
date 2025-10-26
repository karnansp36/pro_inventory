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
  async ({ branchId }, { rejectWithValue }) => {
    try {
      console.log('getDailyReportsByBranch thunk - branchId:', branchId);
      const response = await dailyReportService.getDailyReportsByBranch(branchId);
      console.log('getDailyReportsByBranch thunk - API response:', response);
      console.log('getDailyReportsByBranch thunk - Response type:', typeof response);
      console.log('getDailyReportsByBranch thunk - Is array?:', Array.isArray(response));
      console.log('getDailyReportsByBranch thunk - Response length:', response.length);
      return response; // This should be the array
    } catch (err) {
      console.error('Error in getDailyReportsByBranch thunk:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const dailyReportSlice = createSlice({
  name: 'dailyReport',
  initialState: {
    dailyReports: [],
    loading: false,
    error: null,
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
        console.log('getDailyReportsByBranch - pending - current state:', state.dailyReports);
      })
      .addCase(getDailyReportsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        console.log('getDailyReportsByBranch.fulfilled - action.payload:', action.payload);
        console.log('getDailyReportsByBranch.fulfilled - action.payload type:', typeof action.payload);
        console.log('getDailyReportsByBranch.fulfilled - is Array?:', Array.isArray(action.payload));
        
        // DIRECT ASSIGNMENT - No complex logic
        if (action.payload && Array.isArray(action.payload)) {
          state.dailyReports = action.payload;
          console.log('getDailyReportsByBranch.fulfilled - state.dailyReports set to:', state.dailyReports);
        } else {
          console.warn('Unexpected response format - not an array:', action.payload);
          state.dailyReports = [];
        }
        
        state.error = null;
      })
      .addCase(getDailyReportsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('getDailyReportsByBranch.rejected - error:', action.payload);
      });
  }
});

export const { clearError, setDailyReports } = dailyReportSlice.actions;
export default dailyReportSlice.reducer;