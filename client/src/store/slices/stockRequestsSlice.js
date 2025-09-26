import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

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
        state.stockRequests.push(action.payload); // Assuming the new request is added to the list
      })
      .addCase(createStockRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create stock request';
      });
  },
});

export default stockRequestsSlice.reducer;