import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users API
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateLastLogin: (id) => api.put(`/users/${id}/login`),
};

// Groups API
export const groupsAPI = {
  getAll: (params = {}) => api.get('/groups', { params }),
  getById: (id) => api.get(`/groups/${id}`),
  create: (groupData) => api.post('/groups', groupData),
  update: (id, groupData) => api.put(`/groups/${id}`, groupData),
  delete: (id) => api.delete(`/groups/${id}`),
  addMember: (groupId, userId) => api.post(`/groups/${groupId}/members/${userId}`),
  removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),
};

// Equipments API
export const equipmentsAPI = {
  getAll: (params = {}) => api.get('/equipments', { params }),
  getById: (id) => api.get(`/equipments/${id}`),
  create: (equipmentData) => api.post('/equipments', equipmentData),
  update: (id, equipmentData) => api.put(`/equipments/${id}`, equipmentData),
  delete: (id) => api.delete(`/equipments/${id}`),
  assign: (equipmentId, userId) => api.put(`/equipments/${equipmentId}/assign/${userId}`),
  unassign: (equipmentId) => api.put(`/equipments/${equipmentId}/unassign`),
};

// Office Plans API
export const officePlansAPI = {
  getAll: (params = {}) => api.get('/office-plans', { params }),
  getById: (id) => api.get(`/office-plans/${id}`),
  create: (planData) => api.post('/office-plans', planData),
  update: (id, planData) => api.put(`/office-plans/${id}`, planData),
  delete: (id) => api.delete(`/office-plans/${id}`),
  duplicate: (id, newName, createdBy) => api.post(`/office-plans/${id}/duplicate`, null, {
    params: { new_name: newName, created_by: createdBy }
  }),
  // Elements management
  getElements: (planId) => api.get(`/office-plans/${planId}/elements`),
  addElement: (planId, elementData) => api.post(`/office-plans/${planId}/elements`, elementData),
  updateElement: (planId, elementId, elementData) => api.put(`/office-plans/${planId}/elements/${elementId}`, elementData),
  deleteElement: (planId, elementId) => api.delete(`/office-plans/${planId}/elements/${elementId}`),
};

// Statistics API
export const statisticsAPI = {
  get: () => api.get('/statistics'),
};

export default api;