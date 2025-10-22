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

export const getStockRequests = createAsyncThunk(
  "stockRequests/getAll",
  async (_, { rejectWithValue }) => {
    try {
      return await stockRequestService.getStockRequests();
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createStockRequest = createAsyncThunk(
  "stockRequests/create",
  async (requestData, { rejectWithValue }) => {
    try {
      return await stockRequestService.createStockRequest(requestData);
    } catch (error) {
      return rejectWithValue(error.response.data);
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

export const getStockRequestsByBranch = createAsyncThunk(
  "stockRequests/getStockRequestsByBranch",
  async ({ branchId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await stockRequestService.getStockRequestsByBranch(
        branchId, page, limit
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getStockRequestsByManager = createAsyncThunk(
  "stockRequests/getStockRequestsByManager",
  async ({ managerId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await stockRequestService.getStockRequestsByManager(
        managerId, page, limit
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStockRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStockRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.stockRequests = action.payload;
        state.totalItems = action.payload.totalItems || action.payload.length;
      })
      .addCase(getStockRequests.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch stock requests";
      })
      .addCase(createStockRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStockRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.stockRequests.push(action.payload);
        state.totalItems++;
      })
      .addCase(createStockRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to create stock request";
      })
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
        state.error =
          action.payload?.message || "Failed to approve stock request";
      })
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
        state.error =
          action.payload?.message || "Failed to update stock request";
      })
      .addCase(deleteStockRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStockRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.stockRequests = state.stockRequests.filter(
          (request) => request._id !== action.payload
        );
        state.totalItems--;
      })
      .addCase(deleteStockRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to delete stock request";
      })
      .addCase(getStockRequestsByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStockRequestsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.stockRequests = Array.isArray(action.payload.stockRequests) ? action.payload.stockRequests : [];
        state.totalItems = action.payload.totalItems || action.payload.stockRequests?.length || 0;
      })
      .addCase(getStockRequestsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch stock requests by branch";
      })
      .addCase(getStockRequestsByManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStockRequestsByManager.fulfilled, (state, action) => {
        state.loading = false;
        state.stockRequests = Array.isArray(action.payload.stockRequests) ? action.payload.stockRequests : [];
        state.totalItems = action.payload.totalItems || action.payload.stockRequests?.length || 0;
      })
      .addCase(getStockRequestsByManager.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch stock requests by manager";
      });
  },
});

export const { clearError } = stockRequestsSlice.actions;
export default stockRequestsSlice.reducer;