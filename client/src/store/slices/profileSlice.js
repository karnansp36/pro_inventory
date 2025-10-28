import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

// Async thunk for updating user profile (including banner and profile images)
export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      return await userService.updateUserProfile(userData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update profile' });
    }
  }
);

// Async thunk for updating banner image only
export const updateBannerImage = createAsyncThunk(
  'profile/updateBannerImage',
  async (bannerData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('bannerImage', bannerData.bannerImage);
      
      // Include existing user data to maintain profile information
      if (bannerData.user) {
        Object.keys(bannerData.user).forEach(key => {
          if (key !== 'bannerImage' && key !== 'profileImage' && bannerData.user[key] !== undefined) {
            formData.append(key, bannerData.user[key]);
          }
        });
      }
      
      return await userService.updateUserProfile(formData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update banner image' });
    }
  }
);

// Async thunk for updating profile image only
export const updateProfileImage = createAsyncThunk(
  'profile/updateProfileImage',
  async (profileData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', profileData.profileImage);
      
      // Include existing user data to maintain profile information
      if (profileData.user) {
        Object.keys(profileData.user).forEach(key => {
          if (key !== 'bannerImage' && key !== 'profileImage' && profileData.user[key] !== undefined) {
            formData.append(key, profileData.user[key]);
          }
        });
      }
      
      return await userService.updateUserProfile(formData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update profile image' });
    }
  }
);

// Async thunk for removing banner image
export const removeBannerImage = createAsyncThunk(
  'profile/removeBannerImage',
  async (userData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('bannerImage', '');
      
      // Include existing user data
      if (userData) {
        Object.keys(userData).forEach(key => {
          if (key !== 'bannerImage' && key !== 'profileImage' && userData[key] !== undefined) {
            formData.append(key, userData[key]);
          }
        });
      }
      
      return await userService.updateUserProfile(formData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to remove banner image' });
    }
  }
);

// Async thunk for removing profile image
export const removeProfileImage = createAsyncThunk(
  'profile/removeProfileImage',
  async (userData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', '');
      
      // Include existing user data
      if (userData) {
        Object.keys(userData).forEach(key => {
          if (key !== 'bannerImage' && key !== 'profileImage' && userData[key] !== undefined) {
            formData.append(key, userData[key]);
          }
        });
      }
      
      return await userService.updateUserProfile(formData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to remove profile image' });
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    loading: false,
    error: null,
    success: false,
    uploadProgress: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearProfileState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.uploadProgress = 0;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Update User Profile (general)
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.uploadProgress = 0;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.uploadProgress = 100;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile';
        state.success = false;
        state.uploadProgress = 0;
      })
      // Update Banner Image
      .addCase(updateBannerImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.uploadProgress = 0;
      })
      .addCase(updateBannerImage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.uploadProgress = 100;
        state.error = null;
      })
      .addCase(updateBannerImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update banner image';
        state.success = false;
        state.uploadProgress = 0;
      })
      // Update Profile Image
      .addCase(updateProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.uploadProgress = 0;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.uploadProgress = 100;
        state.error = null;
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile image';
        state.success = false;
        state.uploadProgress = 0;
      })
      // Remove Banner Image
      .addCase(removeBannerImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(removeBannerImage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(removeBannerImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to remove banner image';
        state.success = false;
      })
      // Remove Profile Image
      .addCase(removeProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(removeProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(removeProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to remove profile image';
        state.success = false;
      });
  }
});

export const { 
  clearError, 
  clearSuccess, 
  clearProfileState, 
  setUploadProgress, 
  resetUploadProgress 
} = profileSlice.actions;

export default profileSlice.reducer;