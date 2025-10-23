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

  // NEW: Get expenses by brand owner with filtering
  getExpensesByBrandOwner: async (brandOwnerId, page = 1, limit = 10, filters = {}) => {
    let url = `/expenses/brandowner/${brandOwnerId}?page=${page}&limit=${limit}`;

    // Add filters to the URL
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) { // Only add filter if it has a value
          url += `&${key}=${filters[key]}`;
        }
      });
    }

    const response = await api.get(url);
    return response.data;
  }

};


export default expensesService;