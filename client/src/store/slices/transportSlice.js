import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getTransport = createAsyncThunk(
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
      .addCase(getTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransport.fulfilled, (state, action) => {
        state.loading = false;
        state.transport = action.payload;
      })
      .addCase(getTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch transport data';
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
      });
  },
});

export default transportSlice.reducer;