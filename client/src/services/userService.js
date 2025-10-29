import api from "./api";

const userService = {
  getUsers: async (page = 1, limit = 10, filters = {}) => {
    let url = `/users?page=${page}&limit=${limit}`;

    // Add filters to the URL
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] && filters[key] !== "all") {
          url += `&${key}=${filters[key]}`;
        }
      });
    }

    const response = await api.get(url);
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // New method for creating branch owner
  createBranchOwner: async (branchOwnerData) => {
    const response = await api.post("/users/branch-owner", branchOwnerData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getUsersByRole: async (role, page = 1, limit = 10) => {
    const response = await api.get(
      `/users/role/${role}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  updateUserProfile: async (userData) => {
    const response = await api.put(`/users/profile`, userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUserProfile: async () => {
    const response = await api.get(`/users/me`);
    return response.data;
  },

  getBranchesByManagerId: async (managerId) => {
    const response = await api.get(`/users/branches-by-manager/${managerId}`);
    return response.data;
  },
};

export default userService;