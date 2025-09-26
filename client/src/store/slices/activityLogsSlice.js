// store/slices/activityLogsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks for activity logs
export const getActivityLogs = createAsyncThunk(
  'activityLogs/getActivityLogs',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { startDate, endDate, action, resource, userId } = filters;
      let url = '/api/activity-logs';
      
      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (action) params.append('action', action);
      if (resource) params.append('resource', resource);
      if (userId) params.append('userId', userId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity logs');
    }
  }
);

export const createActivityLog = createAsyncThunk(
  'activityLogs/createActivityLog',
  async (logData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/activity-logs', logData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create activity log');
    }
  }
);

export const clearActivityLogs = createAsyncThunk(
  'activityLogs/clearActivityLogs',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/api/activity-logs/clear');
      return { message: 'Activity logs cleared successfully' };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear activity logs');
    }
  }
);

export const exportActivityLogs = createAsyncThunk(
  'activityLogs/exportActivityLogs',
  async (format = 'excel', { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/export/activity-logs/${format}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-logs-${new Date().toISOString()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { message: `Activity logs exported as ${format}` };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export activity logs');
    }
  }
);

const activityLogsSlice = createSlice({
  name: 'activityLogs',
  initialState: {
    activityLogs: [],
    loading: false,
    error: null,
    filters: {
      startDate: '',
      endDate: '',
      action: '',
      resource: '',
      userId: ''
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        startDate: '',
        endDate: '',
        action: '',
        resource: '',
        userId: ''
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetActivityLogs: (state) => {
      state.activityLogs = [];
      state.loading = false;
      state.error = null;
      state.filters = {
        startDate: '',
        endDate: '',
        action: '',
        resource: '',
        userId: ''
      };
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Activity Logs
      .addCase(getActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.activityLogs = action.payload.logs || action.payload;
        
        // Update pagination if provided in response
        if (action.payload.pagination) {
          state.pagination = { ...state.pagination, ...action.payload.pagination };
        }
      })
      .addCase(getActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Activity Log
      .addCase(createActivityLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createActivityLog.fulfilled, (state, action) => {
        state.loading = false;
        // Add new log to the beginning of the list
        state.activityLogs.unshift(action.payload);
        state.pagination.totalItems += 1;
      })
      .addCase(createActivityLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Clear Activity Logs
      .addCase(clearActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearActivityLogs.fulfilled, (state) => {
        state.loading = false;
        state.activityLogs = [];
        state.pagination = {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20
        };
      })
      .addCase(clearActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Export Activity Logs
      .addCase(exportActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportActivityLogs.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  setPagination, 
  resetActivityLogs 
} = activityLogsSlice.actions;

export default activityLogsSlice.reducer;