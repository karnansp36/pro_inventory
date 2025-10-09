import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Create user (Admin only)
export const createUser = createAsyncThunk(
  'users/create',
  async (userData, { rejectWithValue }) => {
    try {
      // Admin creates users via protected endpoint
      const config = userData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const response = await api.post('/users', userData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update user (Admin only)
export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const config = userData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const response = await api.put(`/users/${id}`, userData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get users by role (Admin, BrandOwner)
export const getUsersByRole = createAsyncThunk(
  'users/getByRole',
  async (role, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/role/${role}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Assign user (Admin, BrandOwner)
export const assignUser = createAsyncThunk(
  'users/assign',
  async ({ id, assignmentData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}/assign`, assignmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get user hierarchy (Admin, BrandOwner, Manager)
export const getUserHierarchy = createAsyncThunk(
  'users/getHierarchy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/hierarchy');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUsers = createAsyncThunk(
  'users/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    userHierarchy: [], // New field for hierarchy
    usersByRole: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch users';
      })
          .addCase(createUser.fulfilled, (state, action) => {
            state.loading = false;
            // push created user
            state.users.push(action.payload);
          })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create user';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.users.findIndex(u => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update user';
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete user';
      })
      .addCase(getUsersByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsersByRole.fulfilled, (state, action) => {
        state.loading = false;
        // store role-specific results without overwriting the global users list
        const role = action.meta?.arg || 'unknown';
        state.usersByRole = {
          ...state.usersByRole,
          [role]: action.payload,
        };
      })
      .addCase(getUsersByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch users by role';
      })
      .addCase(assignUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignUser.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.users.findIndex(u => u._id === action.payload.user._id);
        if (idx !== -1) state.users[idx] = action.payload.user;
      })
      .addCase(assignUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to assign user';
      })
      .addCase(getUserHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserHierarchy.fulfilled, (state, action) => {
        state.loading = false;
        state.userHierarchy = action.payload; // Assuming a new state field for hierarchy
      })
      .addCase(getUserHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch user hierarchy';
      });
  },
});

export default usersSlice.reducer;