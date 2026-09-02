import axios from 'axios';
import {
  normalizeAnalytics,
  normalizeCases,
  normalizeModelStats,
  normalizePaginatedTransactions,
  normalizePrediction,
  normalizeStats,
} from './normalize';

/**
 * Base Axios instance configured for the frontend
 */
export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    // Auto-logout if 401 Unauthorized
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// API Wrappers (returning normalized data)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchStats = async () => {
  const { data } = await apiClient.get('/stats');
  return normalizeStats(data);
};

export const fetchAnalytics = async (userId = 'anonymous') => {
  const { data } = await apiClient.get('/analytics', { params: { userId } });
  return normalizeAnalytics(data);
};

export const fetchModelStats = async (userId = 'anonymous') => {
  const { data } = await apiClient.get('/model-stats', { params: { userId } });
  return normalizeModelStats(data);
};

export const fetchPaginatedTransactions = async ({ page = 1, limit = 100, filter = 'all' } = {}) => {
  const { data } = await apiClient.get('/transactions-page', {
    params: { page, limit, filter },
  });
  return normalizePaginatedTransactions(data);
};

export const fetchCases = async () => {
  const { data } = await apiClient.get('/cases');
  return normalizeCases(data);
};

export const submitCaseReview = async (caseId, reviewPayload) => {
  const { data } = await apiClient.post(`/cases/${caseId}/review`, reviewPayload);
  return data;
};

export const fetchShapExplanation = async (features) => {
  const { data } = await apiClient.post('/shap', features);
  return normalizePrediction(data);
};

export const fetchRecentHistory = async () => {
  const { data } = await apiClient.get('/history');
  return normalizeCases(data);
};

export const uploadDatasetFile = async (file, userId = 'anonymous') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  const { data } = await apiClient.post('/upload-dataset', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
