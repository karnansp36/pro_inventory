import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import expensesService from '../../services/expensesService';

export const getExpenses = createAsyncThunk(
  'expenses/getAll',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return await expensesService.getExpenses(page, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch expenses' });
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/create',
  async (expenseData, { rejectWithValue }) => {
    try {
      return await expensesService.createExpense(expenseData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create expense' });
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await expensesService.updateExpense(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update expense' });
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/delete',
  async (expenseId, { rejectWithValue }) => {
    try {
      await expensesService.deleteExpense(expenseId);
      return expenseId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete expense' });
    }
  }
);

export const getExpensesByBranch = createAsyncThunk(
  'expenses/getExpensesByBranch',
  async ({ branchId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await expensesService.getExpensesByBranch(branchId, page, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch expenses by branch' });
    }
  }
);

export const getExpensesByManager = createAsyncThunk(
  'expenses/getExpensesByManager',
  async ({ managerId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      return await expensesService.getExpensesByManager(managerId, page, limit, filters);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch expenses by manager' });
    }
  }
);

export const getExpensesByBranchOwners = createAsyncThunk(
  'expenses/getExpensesByBranchOwners',
  async ({ branchOwnerIds, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await expensesService.getExpensesByBranchOwners(branchOwnerIds, page, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch expenses by branch owners' });
    }
  }
);

// NEW: Get expenses by brand owner
export const getExpensesByBrandOwner = createAsyncThunk(
  'expenses/getExpensesByBrandOwner',
  async ({ brandOwnerId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      return await expensesService.getExpensesByBrandOwner(brandOwnerId, page, limit, filters);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch expenses by brand owner' });
    }
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: {
    expenses: [],
    totalItems: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearExpenses: (state) => {
      state.expenses = [];
      state.totalItems = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // getExpenses
      .addCase(getExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpenses.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.expenses) {
          state.expenses = action.payload.expenses;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.expenses = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch expenses';
      })
      
      // createExpense
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(action.payload);
        state.totalItems++;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create expense';
      })
      
      // updateExpense
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.expenses.findIndex(expense => expense._id === action.payload._id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update expense';
      })
      
      // deleteExpense
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.filter((expense) => expense._id !== action.payload);
        state.totalItems--;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete expense';
      })
      
      // getExpensesByBranch
      .addCase(getExpensesByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpensesByBranch.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.expenses) {
          state.expenses = action.payload.expenses;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.expenses = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getExpensesByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch expenses by branch';
      })
      
      // getExpensesByManager
      .addCase(getExpensesByManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpensesByManager.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.expenses) {
          state.expenses = action.payload.expenses;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.expenses = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getExpensesByManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch expenses by manager';
      })
      
      // getExpensesByBranchOwners
      .addCase(getExpensesByBranchOwners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpensesByBranchOwners.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.expenses) {
          state.expenses = action.payload.expenses;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.expenses = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getExpensesByBranchOwners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch expenses by branch owners';
      })
       // NEW: getExpensesByBrandOwner
      .addCase(getExpensesByBrandOwner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpensesByBrandOwner.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.expenses) {
          state.expenses = action.payload.expenses;
          state.totalItems = action.payload.totalItems || 0;
        } else {
          state.expenses = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = Array.isArray(action.payload) ? action.payload.length : 0;
        }
      })
      .addCase(getExpensesByBrandOwner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch expenses by brand owner';
      });
  },
});

export const { clearError, clearExpenses } = expensesSlice.actions;
export default expensesSlice.reducer;