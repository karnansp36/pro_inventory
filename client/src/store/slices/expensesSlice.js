import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getExpenses = createAsyncThunk(
  'expenses/getAll',
  async (managerId, { rejectWithValue }) => {
    try {
      let url = '/expenses';
      if (managerId) {
        url = `/expenses/branch/${managerId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/create',
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await api.post('/expenses', expenseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


export const updateExpense = createAsyncThunk(
  'expenses/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/expenses/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/delete',
  async (expenseId, { rejectWithValue }) => {
    try {
      await api.delete(`/expenses/${expenseId}`);
      return expenseId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getExpensesByBranch = createAsyncThunk(
  'expenses/getExpensesByBranch',
  async (branchId, { rejectWithValue }) => {
    try {
     
      const response = await api.get(`/expenses/branch-owner/${branchId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getExpensesByManager = createAsyncThunk(
  'expenses/getExpensesByManager',
  async ({ managerId, filters }, { rejectWithValue }) => {
    try {
      let url = `/expenses/manager/${managerId}`;
      if (filters && filters.branchId) {
        url += `?branchId=${filters.branchId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getExpensesByBranchOwners = createAsyncThunk(
  'expenses/getExpensesByBranchOwners',
  async (branchOwnerIds, { rejectWithValue }) => {
    try {
      const response = await api.post('/expenses/branch-owners', { branchOwnerIds });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: {
    expenses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(getExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch expenses';
      })
      .addCase(getExpensesByManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpensesByManager.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(getExpensesByManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch expenses';
      })
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.push(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create expense';
      })
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.map((expense) =>
          expense._id === action.payload._id ? action.payload : expense
        );
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update expense';
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.filter((expense) => expense._id !== action.payload);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete expense';
      })
      .addCase(getExpensesByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpensesByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(getExpensesByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch expenses by branch';
      })
      .addCase(getExpensesByBranchOwners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpensesByBranchOwners.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(getExpensesByBranchOwners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch expenses by branch owners';
      });
  },
});

export default expensesSlice.reducer;
