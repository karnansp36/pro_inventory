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

// Get all transports with pagination and filters
export const getTransports = createAsyncThunk(
  'transport/getAll',
  async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const response = await transportService.getTransports(page, limit, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch transports' });
    }
  }
);

// Update transport
export const updateTransport = createAsyncThunk(
  'transport/update',
  async ({ id, transportData }, { rejectWithValue }) => {
    try {
      return await transportService.updateTransport(id, transportData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update transport' });
    }
  }
);

// Delete transport
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

// Get transports by branch with pagination
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

// Get transports by brand owner with pagination and filters
export const getTransportsByBrandOwner = createAsyncThunk(
  'transport/getTransportsByBrandOwner',
  async ({ brandOwnerId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await transportService.getTransportsByBrandOwner(brandOwnerId, page, limit, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch transports by brand owner' });
    }
  }
);

// Get transports by manager with pagination (matching stockRequest pattern)
export const getTransportsByManager = createAsyncThunk(
  'transport/getTransportsByManager',
  async ({ managerId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await transportService.getTransportsByManager(managerId, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch transports by manager' });
    }
  }
);

// Receive/confirm transport
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
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetTransports: (state) => {
      state.transport = [];
      state.totalItems = 0;
      state.currentPage = 1;
      state.totalPages = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // getTransports
      .addCase(getTransports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransports.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.transports) {
          state.transport = action.payload.transports;
          state.totalItems = action.payload.totalItems || 0;
          state.currentPage = action.payload.currentPage || 1;
          state.totalPages = action.payload.totalPages || 1;
        } else {
          state.transport = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
          state.currentPage = 1;
          state.totalPages = 1;
        }
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
        const updated = action.payload;
        const idx = state.transport.findIndex((t) => t._id === updated._id);
        if (idx !== -1) {
          state.transport[idx] = updated;
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
        const updated = action.payload;
        const idx = state.transport.findIndex((t) => t._id === updated._id);
        if (idx !== -1) {
          state.transport[idx] = updated;
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
        state.transport = state.transport.filter(
          (transport) => transport._id !== action.payload
        );
        state.totalItems--;
      })
      .addCase(deleteTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete transport';
      })
      
      // getTransportsByBranch
      .addCase(getTransportsByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransportsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.transport = Array.isArray(action.payload.transports) ? action.payload.transports : [];
        state.totalItems = action.payload.totalItems || action.payload.transports?.length || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(getTransportsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch transports by branch';
      })
      
      // getTransportsByManager
      .addCase(getTransportsByManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransportsByManager.fulfilled, (state, action) => {
        state.loading = false;
        state.transport = Array.isArray(action.payload.transports) ? action.payload.transports : [];
        state.totalItems = action.payload.totalItems || action.payload.transports?.length || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(getTransportsByManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch transports by manager';
      })
      
      // getTransportsByBrandOwner
      .addCase(getTransportsByBrandOwner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransportsByBrandOwner.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.transports) {
          state.transport = action.payload.transports;
          state.totalItems = action.payload.totalItems || 0;
          state.currentPage = action.payload.currentPage || 1;
          state.totalPages = action.payload.totalPages || 1;
        } else {
          state.transport = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
          state.currentPage = 1;
          state.totalPages = 1;
        }
      })
      .addCase(getTransportsByBrandOwner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch transports by brand owner';
      });
  },
});

export const { clearError, resetTransports } = transportSlice.actions;
export default transportSlice.reducer;