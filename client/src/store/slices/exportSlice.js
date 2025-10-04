import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as exportService from '../../services/exportService'; // Import all functions from exportService

export const getExportOptions = createAsyncThunk(
  'exports/getOptions',
  async (_, { rejectWithValue }) => {
    try {
      // Assuming an API endpoint to get available export types and formats
      // This might be a separate endpoint or hardcoded if options are static
      // For now, I'll mock a response or assume a simple API call.
      // If there's a specific API for this, it should be used.
      // For demonstration, I'll return a static set of options.
      const response = {
        data: {
          types: ['Sales', 'Expenses', 'StockRequests', 'Transport'],
          formats: ['CSV', 'PDF'],
        },
      };
      // If there's an actual API endpoint for options, use it like:
      // const response = await api.get('/export/options');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch export options');
    }
  }
);

export const generateExport = createAsyncThunk(
  'exports/generate',
  async ({ type, format, startDate, endDate }, { rejectWithValue }) => {
    try {
      let response;
      const params = { startDate, endDate };

      switch (type) {
        case 'Sales':
          response = await exportService.exportSales(format, params);
          break;
        case 'Expenses':
          response = await exportService.exportExpenses(format, params);
          break;
        case 'StockRequests':
          response = await exportService.exportStockRequests(format, params);
          break;
        case 'Transport':
          response = await exportService.exportTransport(format, params);
          break;
        default:
          throw new Error('Invalid export type');
      }

      // Create a blob from the response and trigger download
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Export generated successfully' };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to generate export');
    }
  }
);

const exportSlice = createSlice({
  name: 'exports',
  initialState: {
    exportOptions: {
      types: [],
      formats: [],
    },
    loading: false,
    error: null,
    exportStatus: null, // To track the status of export generation
  },
  reducers: {
    clearExportStatus: (state) => {
      state.exportStatus = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getExportOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExportOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.exportOptions = action.payload;
      })
      .addCase(getExportOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(generateExport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.exportStatus = 'generating';
      })
      .addCase(generateExport.fulfilled, (state, action) => {
        state.loading = false;
        state.exportStatus = 'success';
        // Optionally, you can store a success message or file info here
      })
      .addCase(generateExport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.exportStatus = 'failed';
      });
  },
});

export const { clearExportStatus, clearError } = exportSlice.actions;
export default exportSlice.reducer;