import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
// Thunk to approve a stock request
export const approveStockRequest = createAsyncThunk(
  'stockRequests/approve',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/stockrequests/${requestId}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to approve stock request' });
    }
  }
);

export const getStockRequests = createAsyncThunk(
  'stockRequests/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/stockrequests');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createStockRequest = createAsyncThunk(
  'stockRequests/create',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await api.post('/stockrequests', requestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const stockRequestsSlice = createSlice({
  name: 'stockRequests',
  initialState: {
    stockRequests: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStockRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStockRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.stockRequests = action.payload;
      })
      .addCase(getStockRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch stock requests';
      })
      .addCase(createStockRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStockRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.stockRequests.push(action.payload);
      })
      .addCase(createStockRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create stock request';
      })
      // Approve stock request
      .addCase(approveStockRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveStockRequest.fulfilled, (state, action) => {
        state.loading = false;
        // Update the approved request in the list
        const updated = action.payload;
        const idx = state.stockRequests.findIndex(r => r._id === updated._id);
        if (idx !== -1) {
          state.stockRequests[idx] = updated;
        }
      })
      .addCase(approveStockRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to approve stock request';
      });
  },
});

export default stockRequestsSlice.reducer;