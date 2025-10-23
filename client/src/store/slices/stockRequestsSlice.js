import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import stockRequestService from "../../services/stockRequestService";

// Thunk to approve a stock request
export const approveStockRequest = createAsyncThunk(
  "stockRequests/approve",
  async (requestId, { rejectWithValue }) => {
    try {
      return await stockRequestService.approveStockRequest(requestId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to approve stock request" }
      );
    }
  }
);

// Updated getStockRequests with pagination and filters
export const getStockRequests = createAsyncThunk(
  "stockRequests/getAll",
  async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
    try {
      return await stockRequestService.getStockRequests(page, limit, filters);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch stock requests" }
      );
    }
  }
);

export const createStockRequest = createAsyncThunk(
  "stockRequests/create",
  async (requestData, { rejectWithValue }) => {
    try {
      return await stockRequestService.createStockRequest(requestData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create stock request" }
      );
    }
  }
);

export const updateStockRequest = createAsyncThunk(
  "stockRequests/update",
  async ({ id, stockRequestData }, { rejectWithValue }) => {
    try {
      return await stockRequestService.updateStockRequest(id, stockRequestData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update stock request" }
      );
    }
  }
);

export const deleteStockRequest = createAsyncThunk(
  "stockRequests/delete",
  async (requestId, { rejectWithValue }) => {
    try {
      await stockRequestService.deleteStockRequest(requestId);
      return requestId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete stock request" }
      );
    }
  }
);

// Updated getStockRequestsByBranch with filters
export const getStockRequestsByBranch = createAsyncThunk(
  "stockRequests/getStockRequestsByBranch",
  async ({ branchId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await stockRequestService.getStockRequestsByBranch(
        branchId, page, limit, filters
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch stock requests by branch" }
      );
    }
  }
);

// Updated getStockRequestsByManager with filters
export const getStockRequestsByManager = createAsyncThunk(
  "stockRequests/getStockRequestsByManager",
  async ({ managerId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await stockRequestService.getStockRequestsByManager(
        managerId, page, limit, filters
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch stock requests by manager" }
      );
    }
  }
);

// Updated getStockRequestsByBrandOwner with filters
export const getStockRequestsByBrandOwner = createAsyncThunk(
  "stockRequests/getStockRequestsByBrandOwner",
  async ({ brandOwnerId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await stockRequestService.getStockRequestsByBrandOwner(
        brandOwnerId, page, limit, filters
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch stock requests by brand owner" }
      );
    }
  }
);

const stockRequestsSlice = createSlice({
  name: "stockRequests",
  initialState: {
    stockRequests: [],
    totalItems: 0,
    loading: false,
    error: null,
    currentPage: 1,
    itemsPerPage: 10,
    filters: {
      searchTerm: '',
      statusFilter: 'all',
      priorityFilter: 'all',
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
      state.currentPage = 1; // Reset to first page when items per page changes
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {
        searchTerm: '',
        statusFilter: 'all',
        priorityFilter: 'all',
        dateFilter: { type: 'all', startDate: '', endDate: '' }
      };
      state.currentPage = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // getStockRequests
      .addCase(getStockRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStockRequests.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.stockRequests) {
          state.stockRequests = action.payload.stockRequests;
          state.totalItems = action.payload.totalItems || 0;
          state.currentPage = action.payload.currentPage || 1;
        } else {
          state.stockRequests = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getStockRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch stock requests";
      })
      
      // createStockRequest
      .addCase(createStockRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStockRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.stockRequests.unshift(action.payload); // Add to beginning
        state.totalItems++;
      })
      .addCase(createStockRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create stock request";
      })
      
      // approveStockRequest
      .addCase(approveStockRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveStockRequest.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const idx = state.stockRequests.findIndex((r) => r._id === updated._id);
        if (idx !== -1) {
          state.stockRequests[idx] = updated;
        }
      })
      .addCase(approveStockRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to approve stock request";
      })
      
      // updateStockRequest
      .addCase(updateStockRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStockRequest.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const idx = state.stockRequests.findIndex((r) => r._id === updated._id);
        if (idx !== -1) {
          state.stockRequests[idx] = updated;
        }
      })
      .addCase(updateStockRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update stock request";
      })
      
      // deleteStockRequest
      .addCase(deleteStockRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStockRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.stockRequests = state.stockRequests.filter(
          (request) => request._id !== action.payload
        );
        state.totalItems = Math.max(0, state.totalItems - 1);
      })
      .addCase(deleteStockRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete stock request";
      })
      
      // getStockRequestsByBranch
      .addCase(getStockRequestsByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStockRequestsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.stockRequests = Array.isArray(action.payload.stockRequests) ? action.payload.stockRequests : [];
        state.totalItems = action.payload.totalItems || 0;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(getStockRequestsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch stock requests by branch";
      })
      
      // getStockRequestsByManager
      .addCase(getStockRequestsByManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStockRequestsByManager.fulfilled, (state, action) => {
        state.loading = false;
        state.stockRequests = Array.isArray(action.payload.stockRequests) ? action.payload.stockRequests : [];
        state.totalItems = action.payload.totalItems || 0;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(getStockRequestsByManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch stock requests by manager";
      })
      
      // getStockRequestsByBrandOwner
      .addCase(getStockRequestsByBrandOwner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStockRequestsByBrandOwner.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.stockRequests) {
          state.stockRequests = action.payload.stockRequests;
          state.totalItems = action.payload.totalItems || 0;
          state.currentPage = action.payload.currentPage || 1;
        } else {
          state.stockRequests = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getStockRequestsByBrandOwner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch stock requests by brand owner";
      });
  },
});

export const { 
  clearError, 
  setCurrentPage, 
  setItemsPerPage, 
  setFilters, 
  clearFilters 
} = stockRequestsSlice.actions;

export default stockRequestsSlice.reducer;