import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getSales = createAsyncThunk(
  'sales/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/sales');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/create',
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteSale = createAsyncThunk(
  'sales/delete',
  async (saleId, { rejectWithValue }) => {
    try {
      await api.delete(`/sales/${saleId}`);
      return saleId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState: {
    sales: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(getSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch sales';
      })
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.push(action.payload);
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create sale';
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = state.sales.filter((sale) => sale._id !== action.payload);
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete sale';
      });
  },
});

export default salesSlice.reducer;