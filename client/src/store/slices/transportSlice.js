// Thunk to create a new transport
export const createTransport = createAsyncThunk(
  'transport/create',
  async (transportData, { rejectWithValue }) => {
    try {
      const response = await api.post('/transport', transportData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getTransports = createAsyncThunk(
  'transport/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/transport');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTransport = createAsyncThunk(
  'transport/update',
  async ({ id, receivedQuantity }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/transport/${id}`, { receivedQuantity });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


export const deleteTransport = createAsyncThunk(
  'transport/delete',
  async (transportId, { rejectWithValue }) => {
    try {
      await api.delete(`/transport/${transportId}`);
      return transportId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete transport' });
    }
  }
);

export const getTransportsByBranch = createAsyncThunk(
  'transport/getTransportsByBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transport/branch/${branchId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const transportSlice = createSlice({
  name: 'transport',
  initialState: {
    transport: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTransports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransports.fulfilled, (state, action) => {
        state.loading = false;
        state.transport = action.payload;
      })
      .addCase(getTransports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch transport data';
      })
      .addCase(createTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransport.fulfilled, (state, action) => {
        state.loading = false;
        state.transport.push(action.payload);
      })
      .addCase(createTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create transport';
      })
      .addCase(updateTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransport.fulfilled, (state, action) => {
        state.loading = false;
        state.transport = state.transport.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })
      .addCase(updateTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update transport data';
      })
      .addCase(deleteTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransport.fulfilled, (state, action) => {
        state.loading = false;
        state.transport = state.transport.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete transport';
      })
      .addCase(getTransportsByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransportsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.transport = action.payload;
      })
      .addCase(getTransportsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch transports by branch';
      });
  },
});

export default transportSlice.reducer;