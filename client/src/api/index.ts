import axios from 'axios';
import { Form, FormSubmission, ApiResponse, PaginatedResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth (if needed later)
api.interceptors.request.use((config) => {
  // Add auth token here if implementing authentication
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Form API endpoints
export const formApi = {
  // Get all forms
  getForms: async (page = 1, limit = 10): Promise<PaginatedResponse<Form>> => {
    const response = await api.get(`/forms?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get form by ID
  getForm: async (id: string): Promise<Form> => {
    const response = await api.get(`/forms/${id}`);
    return response.data.data;
  },

  // Create new form
  createForm: async (form: Partial<Form>): Promise<Form> => {
    const response = await api.post('/forms', form);
    return response.data.data;
  },

  // Update form
  updateForm: async (id: string, form: Partial<Form>): Promise<Form> => {
    const response = await api.put(`/forms/${id}`, form);
    return response.data.data;
  },

  // Delete form
  deleteForm: async (id: string): Promise<void> => {
    await api.delete(`/forms/${id}`);
  },

  // Publish/unpublish form
  togglePublish: async (id: string, isPublished: boolean): Promise<Form> => {
    const response = await api.patch(`/forms/${id}/publish`, { isPublished });
    return response.data.data;
  },

  // Duplicate form
  duplicateForm: async (id: string): Promise<Form> => {
    const response = await api.post(`/forms/${id}/duplicate`);
    return response.data.data;
  },
};

// Submission API endpoints
export const submissionApi = {
  // Submit form
  submitForm: async (formId: string, data: Record<string, any>): Promise<FormSubmission> => {
    const response = await api.post(`/forms/${formId}/submit`, { data });
    return response.data.data;
  },

  // Get form submissions
  getSubmissions: async (
    formId: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<FormSubmission>> => {
    const response = await api.get(`/forms/${formId}/submissions?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get submission by ID
  getSubmission: async (formId: string, submissionId: string): Promise<FormSubmission> => {
    const response = await api.get(`/forms/${formId}/submissions/${submissionId}`);
    return response.data.data;
  },

  // Export submissions as CSV
  exportSubmissions: async (formId: string): Promise<Blob> => {
    const response = await api.get(`/forms/${formId}/submissions/export`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete submission
  deleteSubmission: async (formId: string, submissionId: string): Promise<void> => {
    await api.delete(`/forms/${formId}/submissions/${submissionId}`);
  },
};

// Analytics API endpoints
export const analyticsApi = {
  // Get form analytics
  getFormAnalytics: async (formId: string, period = '30d') => {
    const response = await api.get(`/forms/${formId}/analytics?period=${period}`);
    return response.data.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data.data;
  },
};

export default api;