import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productPaymentService from "../../services/productPaymentService";

// Thunk to get product payments by user ID from URL parameter
export const getProductPaymentsByUserId = createAsyncThunk(
  "productPayments/getByUserId",
  async ({ userId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await productPaymentService.getProductPaymentsByUserId(userId, page, limit, filters);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch product payments by user" }
      );
    }
  }
);

// Thunk to get logged-in user's own payments
export const getMyProductPayments = createAsyncThunk(
  "productPayments/getMyPayments",
  async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const response = await productPaymentService.getMyProductPayments(page, limit, filters);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch your product payments" }
      );
    }
  }
);

// Thunk to create product payment
export const createProductPayment = createAsyncThunk(
  "productPayments/create",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await productPaymentService.createProductPayment(paymentData);
      return response;
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
      const response = await productPaymentService.updateProductPayment(id, paymentData);
      return response;
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

const productPaymentsSlice = createSlice({
  name: "productPayments",
  initialState: {
    productPayments: [],
    totalItems: 0,
    loading: false,
    error: null,
    currentPage: 1,
    itemsPerPage: 10,
    currentUser: null, // User whose payments are being displayed
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
      startDate: '',
      endDate: ''
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
        startDate: '',
        endDate: ''
      };
      state.currentPage = 1;
    },
    clearProductPayments: (state) => {
      state.productPayments = [];
      state.totalItems = 0;
      state.currentPage = 1;
      state.currentUser = null;
      state.summary = {
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0,
      };
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
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
        state.currentUser = action.payload.user || null;
        state.summary = action.payload.summary || state.summary;
      })
      .addCase(getProductPaymentsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch product payments by user";
      })
      
      // getMyProductPayments
      .addCase(getMyProductPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyProductPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.productPayments = action.payload.productPayments || [];
        state.totalItems = action.payload.totalItems || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.currentUser = action.payload.user || null;
        state.summary = action.payload.summary || state.summary;
      })
      .addCase(getMyProductPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch your product payments";
      })
      
      // createProductPayment
      .addCase(createProductPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.productPayments.unshift(action.payload);
        state.totalItems += 1;
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
      });
  },
});

export const { 
  clearError, 
  setCurrentPage, 
  setItemsPerPage, 
  setFilters, 
  clearFilters,
  clearProductPayments,
  setCurrentUser
} = productPaymentsSlice.actions;

export default productPaymentsSlice.reducer;