import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('recipe_companion_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getUsers: (search) => api.get(`/auth/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getUserProfile: (id) => api.get(`/auth/user/${id}`),
};

// Recipe API
export const recipeAPI = {
  getAll: (params) => api.get('/recipes', { params }),
  getFeatured: () => api.get('/recipes/featured'),
  getRegions: () => api.get('/recipes/regions'),
  getCategories: () => api.get('/recipes/categories'),
  getMyRecipes: () => api.get('/recipes/my-recipes'),
  getSaved: () => api.get('/recipes/saved'),
  getById: (id) => api.get(`/recipes/${id}`),
  create: (data) => api.post('/recipes', data),
  update: (id, data) => api.put(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`),
  toggleLike: (id) => api.post(`/recipes/${id}/like`),
  toggleBookmark: (id) => api.post(`/recipes/${id}/bookmark`),
  rate: (id, data) => api.post(`/recipes/${id}/rate`, data),
  deleteRating: (recipeId, ratingId) => api.delete(`/recipes/${recipeId}/rate/${ratingId}`),
};

// Meal Plan API
export const mealPlanAPI = {
  getAll: () => api.get('/meal-plans'),
  getActive: (params) => api.get('/meal-plans/active', { params }),
  createOrUpdate: (data) => api.post('/meal-plans', data),
  addMeal: (data) => api.post('/meal-plans/add-meal', data),
  removeMeal: (data) => api.post('/meal-plans/remove-meal', data),
  getShoppingList: (id) => api.get(`/meal-plans/${id}/shopping-list`),
};

// AI API — powered by OpenRouter GPT-4o
export const aiAPI = {
  generateRecipe: (data) => api.post('/ai/generate', data),
  chefChat: (data) => api.post('/ai/chef-chat', data),
  mealSuggestions: (data) => api.post('/ai/meal-suggestions', data),
};


// Community API
export const communityAPI = {
  getAll: (params) => api.get('/communities', { params }),
  getById: (id) => api.get(`/communities/${id}`),
  create: (data) => api.post('/communities', data),
  joinLeave: (id) => api.post(`/communities/${id}/join`),
  getPosts: (id) => api.get(`/communities/${id}/posts`),
  createPost: (id, data) => api.post(`/communities/${id}/posts`, data),
  toggleLikePost: (postId) => api.post(`/communities/posts/${postId}/like`),
  commentPost: (postId, data) => api.post(`/communities/posts/${postId}/comment`, data),
};

// Chat API
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId) => api.get(`/chat/messages/${conversationId}`),
  sendMessage: (data) => api.post('/chat/messages', data),
  markRead: (conversationId) => api.post(`/chat/read/${conversationId}`),
};

// Grocery API
export const groceryAPI = {
  generateLinks: (data) => api.post('/grocery/generate-links', data),
};

export default api;
