import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productPaymentService from "../../services/productPaymentService";

// Thunk to get all product payments
export const getProductPayments = createAsyncThunk(
  "productPayments/getAll",
  async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
    try {
      return await productPaymentService.getProductPayments(page, limit, filters);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch product payments" }
      );
    }
  }
);

// Thunk to create product payment
export const createProductPayment = createAsyncThunk(
  "productPayments/create",
  async (paymentData, { rejectWithValue }) => {
    try {
      return await productPaymentService.createProductPayment(paymentData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create product payment" }
      );
    }
  }
);

// Thunk to update product payment
export const updateProductPayment = createAsyncThunk(
  "productPayments/update",
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      return await productPaymentService.updateProductPayment(id, paymentData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update product payment" }
      );
    }
  }
);

// Thunk to delete product payment
export const deleteProductPayment = createAsyncThunk(
  "productPayments/delete",
  async (paymentId, { rejectWithValue }) => {
    try {
      await productPaymentService.deleteProductPayment(paymentId);
      return paymentId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete product payment" }
      );
    }
  }
);

// Thunk to get product payments by user ID
export const getProductPaymentsByUserId = createAsyncThunk(
  "productPayments/getByUserId",
  async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await productPaymentService.getProductPaymentsByUserId(userId, page, limit);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch product payments by user" }
      );
    }
  }
);

const productPaymentsSlice = createSlice({
  name: "productPayments",
  initialState: {
    productPayments: [],
    totalItems: 0,
    loading: false,
    error: null,
    currentPage: 1,
    itemsPerPage: 10,
    summary: {
      totalAmount: 0,
      totalPaid: 0,
      totalPending: 0,
    },
    filters: {
      search: '',
      status: 'all',
      minAmount: '',
      maxAmount: '',
      dateFilter: { type: 'all', startDate: '', endDate: '' }
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: 'all',
        minAmount: '',
        maxAmount: '',
        dateFilter: { type: 'all', startDate: '', endDate: '' }
      };
      state.currentPage = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // getProductPayments
      .addCase(getProductPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.productPayments = action.payload.productPayments || [];
        state.totalItems = action.payload.totalItems || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.summary = action.payload.summary || state.summary;
      })
      .addCase(getProductPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch product payments";
      })
      
      // createProductPayment
      .addCase(createProductPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.productPayments.unshift(action.payload);
        state.totalItems++;
        // Update summary
        state.summary.totalAmount += action.payload.totalAmount;
        state.summary.totalPaid += action.payload.paymentDone;
        state.summary.totalPending += action.payload.remainingBalance;
      })
      .addCase(createProductPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create product payment";
      })
      
      // updateProductPayment
      .addCase(updateProductPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductPayment.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.productPayments.findIndex(item => item._id === updated._id);
        if (index !== -1) {
          // Update summary by subtracting old values and adding new ones
          const oldItem = state.productPayments[index];
          state.summary.totalAmount = state.summary.totalAmount - oldItem.totalAmount + updated.totalAmount;
          state.summary.totalPaid = state.summary.totalPaid - oldItem.paymentDone + updated.paymentDone;
          state.summary.totalPending = state.summary.totalPending - oldItem.remainingBalance + updated.remainingBalance;
          
          state.productPayments[index] = updated;
        }
      })
      .addCase(updateProductPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update product payment";
      })
      
      // deleteProductPayment
      .addCase(deleteProductPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductPayment.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        const deletedItem = state.productPayments.find(item => item._id === deletedId);
        
        if (deletedItem) {
          // Update summary
          state.summary.totalAmount -= deletedItem.totalAmount;
          state.summary.totalPaid -= deletedItem.paymentDone;
          state.summary.totalPending -= deletedItem.remainingBalance;
          
          state.productPayments = state.productPayments.filter(item => item._id !== deletedId);
          state.totalItems = Math.max(0, state.totalItems - 1);
        }
      })
      .addCase(deleteProductPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete product payment";
      })
      
      // getProductPaymentsByUserId
      .addCase(getProductPaymentsByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductPaymentsByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.productPayments = action.payload.productPayments || [];
        state.totalItems = action.payload.totalItems || 0;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(getProductPaymentsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch product payments by user";
      });
  },
});

export const { 
  clearError, 
  setCurrentPage, 
  setItemsPerPage, 
  setFilters, 
  clearFilters 
} = productPaymentsSlice.actions;

export default productPaymentsSlice.reducer;