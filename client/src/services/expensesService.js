import api from './api';

const expensesService = {
  getExpenses: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },
  getExpensesByBranch: async (branchOwnerId) => {
    const response = await api.get(`/expenses/branch/${branchOwnerId}`);
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
};

export default expensesService;