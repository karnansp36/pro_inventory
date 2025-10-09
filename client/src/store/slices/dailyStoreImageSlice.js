import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dailyStoreImageService from '../../services/dailyStoreImageService';

const initialState = {
  dailyStoreImages: [],
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

// Get daily store images by branch
export const getDailyStoreImagesByBranch = createAsyncThunk(
  'dailyStoreImages/getByBranch',
  async (branchId, thunkAPI) => {
    try {
      return await dailyStoreImageService.getDailyStoreImagesByBranch(branchId);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all daily store images
export const getAllDailyStoreImages = createAsyncThunk(
  'dailyStoreImages/getAll',
  async (_, thunkAPI) => {
    try {
      return await dailyStoreImageService.getAllDailyStoreImages();
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
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadDailyStoreImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadDailyStoreImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.dailyStoreImages.push(action.payload);
      })
      .addCase(uploadDailyStoreImage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getDailyStoreImagesByBranch.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDailyStoreImagesByBranch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.dailyStoreImages = action.payload;
      })
      .addCase(getDailyStoreImagesByBranch.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllDailyStoreImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllDailyStoreImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.dailyStoreImages = action.payload;
      })
      .addCase(getAllDailyStoreImages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = dailyStoreImageSlice.actions;
export default dailyStoreImageSlice.reducer;