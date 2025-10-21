import api from './api';

const expensesService = {
  getExpenses: async (page = 1, limit = 10) => {
    const response = await api.get(`/expenses?page=${page}&limit=${limit}`);
    return response.data;
  },

  getExpensesByBranch: async (branchOwnerId, page = 1, limit = 10) => {
    const response = await api.get(`/expenses/branch-owner/${branchOwnerId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  getExpensesByManager: async (managerId, page = 1, limit = 10, filters = {}) => {
    let url = `/expenses/manager/${managerId}?page=${page}&limit=${limit}`;
    if (filters.branchId) {
      url += `&branchId=${filters.branchId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  createExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  updateExpense: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  getExpensesByBranchOwners: async (branchOwnerIds, page = 1, limit = 10) => {
    const queryString = Array.isArray(branchOwnerIds) 
      ? branchOwnerIds.map(id => `branchOwnerIds=${id}`).join('&')
      : `branchOwnerIds=${branchOwnerIds}`;
    const response = await api.get(`/expenses/branch-owners?${queryString}&page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default expensesService;