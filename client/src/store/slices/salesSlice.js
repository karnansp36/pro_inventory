import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import salesService from '../../services/salesService'; // Import the service, not api directly

export const getSales = createAsyncThunk(
  'sales/getAll',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return await salesService.getSales(page, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch sales' });
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/create',
  async (saleData, { rejectWithValue }) => {
    try {
      return await salesService.createSale(saleData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create sale' });
    }
  }
);

export const deleteSale = createAsyncThunk(
  'sales/delete',
  async (saleId, { rejectWithValue }) => {
    try {
      await salesService.deleteSale(saleId);
      return saleId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete sale' });
    }
  }
);

export const updateSale = createAsyncThunk(
  'sales/update',
  async ({ id, saleData }, { rejectWithValue }) => {
    try {
      return await salesService.updateSale(id, saleData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update sale' });
    }
  }
);

export const getSalesByBranch = createAsyncThunk(
  'sales/getSalesByBranch',
  async ({ branchId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      return await salesService.getSalesByBranch(branchId, page, limit, filters);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch sales by branch' });
    }
  }
);

export const getSalesByManager = createAsyncThunk(
  'sales/getSalesByManager',
  async ({ managerId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      return await salesService.getSalesByManager(managerId, page, limit, filters);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch sales by manager' });
    }
  }
);

export const getSalesByBrandOwner = createAsyncThunk(
  'sales/getSalesByBrandOwner',
  async ({ brandOwnerId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      return await salesService.getSalesByBrandOwner(brandOwnerId, page, limit, filters);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch sales by brand owner' });
    }
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState: {
    sales: [],
    totalItems: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSales: (state) => {
      state.sales = [];
      state.totalItems = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSales.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.sales) {
          state.sales = action.payload.sales;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.sales = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
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
        state.sales.unshift(action.payload);
        state.totalItems++;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create sale';
      })
      .addCase(deleteSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = state.sales.filter((sale) => sale._id !== action.payload);
        state.totalItems--;
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete sale';
      })
      .addCase(updateSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sales.findIndex(sale => sale._id === action.payload._id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update sale';
      })
      .addCase(getSalesByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSalesByBranch.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.sales) {
          state.sales = action.payload.sales;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.sales = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getSalesByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch sales by branch';
      })
      .addCase(getSalesByManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSalesByManager.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.sales) {
          state.sales = action.payload.sales;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.sales = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getSalesByManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch sales by manager';
      })
      .addCase(getSalesByBrandOwner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSalesByBrandOwner.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.sales) {
          state.sales = action.payload.sales;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.sales = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getSalesByBrandOwner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch sales by brand owner';
      });
  }
});

export const { clearError, clearSales } = salesSlice.actions;
export default salesSlice.reducer;