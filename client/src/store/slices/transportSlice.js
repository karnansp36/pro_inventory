import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transportService from '../../services/transportService';

// Thunk to create a new transport
export const createTransport = createAsyncThunk(
  'transport/create',
  async (transportData, { rejectWithValue }) => {
    try {
      return await transportService.createTransport(transportData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create transport' });
    }
  }
);

export const getTransports = createAsyncThunk(
  'transport/getAll',
  async (_, { rejectWithValue }) => {
    try {
      return await transportService.getTransports();
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch transports' });
    }
  }
);

export const updateTransport = createAsyncThunk(
  'transport/update',
  async ({ id, receivedQuantity }, { rejectWithValue }) => {
    try {
      return await transportService.updateTransport(id, { receivedQuantity });
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update transport' });
    }
  }
);

export const deleteTransport = createAsyncThunk(
  'transport/delete',
  async (transportId, { rejectWithValue }) => {
    try {
      await transportService.deleteTransport(transportId);
      return transportId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete transport' });
    }
  }
);

export const getTransportsByBranch = createAsyncThunk(
  'transport/getTransportsByBranch',
  async ({ branchId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await transportService.getTransportsByBranch(branchId, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch transports by branch' });
    }
  }
);

// Add receive transport thunk
export const receiveTransport = createAsyncThunk(
  'transport/receive',
  async ({ id, receivedQuantity }, { rejectWithValue }) => {
    try {
      return await transportService.receiveTransport(id, receivedQuantity);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to confirm received transport' });
    }
  }
);

const transportSlice = createSlice({
  name: 'transport',
  initialState: {
    transport: [],
    totalItems: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // getTransportsByBranch
      .addCase(getTransportsByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransportsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        // Handle paginated response format
        if (action.payload.transports) {
          state.transport = action.payload.transports;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          // Fallback for non-paginated response
          state.transport = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getTransportsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch transports by branch';
      })
      
      // getTransports
      .addCase(getTransports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransports.fulfilled, (state, action) => {
        state.loading = false;
        state.transport = action.payload;
        state.totalItems = action.payload.length;
      })
      .addCase(getTransports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch transports';
      })
      
      // createTransport
      .addCase(createTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransport.fulfilled, (state, action) => {
        state.loading = false;
        state.transport.push(action.payload);
        state.totalItems++;
      })
      .addCase(createTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create transport';
      })
      
      // updateTransport
      .addCase(updateTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transport.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.transport[index] = action.payload;
        }
      })
      .addCase(updateTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update transport';
      })
      
      // receiveTransport
      .addCase(receiveTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receiveTransport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transport.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.transport[index] = action.payload;
        }
      })
      .addCase(receiveTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to confirm received transport';
      })
      
      // deleteTransport
      .addCase(deleteTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransport.fulfilled, (state, action) => {
        state.loading = false;
        state.transport = state.transport.filter(item => item._id !== action.payload);
        state.totalItems--;
      })
      .addCase(deleteTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete transport';
      });
  },
});

export const { clearError } = transportSlice.actions;
export default transportSlice.reducer;