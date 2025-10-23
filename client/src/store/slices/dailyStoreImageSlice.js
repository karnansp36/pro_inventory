// ==================== dailyStoreImageSlice.js ====================
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dailyStoreImageService from '../../services/dailyStoreImageService';

const initialState = {
  dailyStoreImages: [],
  totalItems: 0,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Upload daily store image
export const uploadDailyStoreImage = createAsyncThunk(
  'dailyStoreImages/upload',
  async (imageData, thunkAPI) => {
    try {
      return await dailyStoreImageService.uploadDailyStoreImage(imageData);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get daily store images by branch with pagination
export const getDailyStoreImagesByBranch = createAsyncThunk(
  'dailyStoreImages/getByBranch',
  async ({ branchId, page = 1, limit = 10 }, thunkAPI) => {
    try {
      return await dailyStoreImageService.getDailyStoreImagesByBranch(branchId, page, limit);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all daily store images with pagination
export const getAllDailyStoreImages = createAsyncThunk(
  'dailyStoreImages/getAll',
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      return await dailyStoreImageService.getAllDailyStoreImages(page, limit);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get daily store images for the logged-in branch owner with pagination
export const getDailyStoreImagesForBranchOwner = createAsyncThunk(
  'dailyStoreImages/getForBranchOwner',
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      return await dailyStoreImageService.getDailyStoreImagesForBranchOwner(page, limit);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get daily store images by manager with pagination
export const getDailyStoreImagesByManager = createAsyncThunk(
  'dailyStoreImages/getByManager',
  async ({ managerId, page = 1, limit = 10 }, thunkAPI) => {
    try {
      return await dailyStoreImageService.getDailyStoreImagesByManager(managerId, page, limit);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// dailyStoreImageSlice.js - Add this async thunk
export const getDailyStoreImagesByBrandOwner = createAsyncThunk(
  'dailyStoreImages/getByBrandOwner',
  async ({ brandOwnerId, page = 1, limit = 10, filters = {} }, thunkAPI) => {
    try {
      return await dailyStoreImageService.getDailyStoreImagesByBrandOwner(brandOwnerId, page, limit, filters);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);
export const dailyStoreImageSlice = createSlice({
  name: 'dailyStoreImages',
  initialState,
  reducers: {
    reset: (state) => {
      state.dailyStoreImages = [];
      state.totalItems = 0;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearError: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // uploadDailyStoreImage
      .addCase(uploadDailyStoreImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadDailyStoreImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.dailyStoreImages.unshift(action.payload);
        state.totalItems += 1;
      })
      .addCase(uploadDailyStoreImage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // getDailyStoreImagesByBranch
      .addCase(getDailyStoreImagesByBranch.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDailyStoreImagesByBranch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.images) {
          state.dailyStoreImages = action.payload.images;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.dailyStoreImages = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getDailyStoreImagesByBranch.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // getAllDailyStoreImages
      .addCase(getAllDailyStoreImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllDailyStoreImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.images) {
          state.dailyStoreImages = action.payload.images;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.dailyStoreImages = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getAllDailyStoreImages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // getDailyStoreImagesForBranchOwner
      .addCase(getDailyStoreImagesForBranchOwner.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDailyStoreImagesForBranchOwner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.images) {
          state.dailyStoreImages = action.payload.images;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.dailyStoreImages = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getDailyStoreImagesForBranchOwner.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // getDailyStoreImagesByManager
      .addCase(getDailyStoreImagesByManager.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDailyStoreImagesByManager.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.images) {
          state.dailyStoreImages = action.payload.images;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.dailyStoreImages = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getDailyStoreImagesByManager.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })// getDailyStoreImagesByBrandOwner
    .addCase(getDailyStoreImagesByBrandOwner.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(getDailyStoreImagesByBrandOwner.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      if (action.payload.images) {
        state.dailyStoreImages = action.payload.images;
        state.totalItems = action.payload.totalItems || 0;
      } else {
        state.dailyStoreImages = Array.isArray(action.payload) ? action.payload : [];
        state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
      }
    })
    .addCase(getDailyStoreImagesByBrandOwner.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    });
  },
});

export const { reset, clearError } = dailyStoreImageSlice.actions;
export default dailyStoreImageSlice.reducer;