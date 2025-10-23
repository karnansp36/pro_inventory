import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

export const getUsers = createAsyncThunk(
  'users/getAll',
  async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
    try {
      return await userService.getUsers(page, limit, filters);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch users' });
    }
  }
);

export const getUserById = createAsyncThunk(
  'users/getById',
  async (id, { rejectWithValue }) => {
    try {
      return await userService.getUserById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch user' });
    }
  }
);

export const createUser = createAsyncThunk(
  'users/create',
  async (userData, { rejectWithValue }) => {
    try {
      return await userService.createUser(userData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create user' });
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      return await userService.updateUser(id, userData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update user' });
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete user' });
    }
  }
);

export const getUsersByRole = createAsyncThunk(
  'users/getByRole',
  async ({ role, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return await userService.getUsersByRole(role, page, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch users by role' });
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    currentUser: null,
    usersByRole: {},
    totalItems: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUsers: (state) => {
      state.users = [];
      state.totalItems = 0;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Users
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.users) {
          state.users = action.payload.users;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.users = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch users';
      })
      // Get User By ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch user';
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload);
        state.totalItems++;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create user';
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser._id === action.payload._id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update user';
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
        state.totalItems--;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete user';
      })
      // Get Users By Role
      .addCase(getUsersByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsersByRole.fulfilled, (state, action) => {
        state.loading = false;
        const role = action.meta?.arg?.role || 'unknown';
        state.usersByRole[role] = action.payload.users || [];
      })
      .addCase(getUsersByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch users by role';
      });
  }
});

export const { clearError, clearUsers, clearCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;