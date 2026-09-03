import axios from 'axios';
import {
  normalizeAnalytics,
  normalizeCases,
  normalizeModelStats,
  normalizePaginatedTransactions,
  normalizePrediction,
  normalizeStats,
} from './normalize';

const API_BASE_URL = 'https://fraudlens-d30p.onrender.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fraudlens_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

    // Auto-logout if token is invalid/expired
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('fraudlens_token');
      localStorage.removeItem('fraudlens_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// API Wrappers (returning normalized data)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchStats = async () => {
  const { data } = await apiClient.get('/api/stats');
  return normalizeStats(data);
};

export const fetchAnalytics = async () => {
  const { data } = await apiClient.get('/api/analytics');
  return normalizeAnalytics(data);
};

export const fetchModelStats = async () => {
  const { data } = await apiClient.get('/api/model-stats');
  return normalizeModelStats(data);
};

export const fetchPaginatedTransactions = async ({ page = 1, limit = 100, filter = 'all' } = {}) => {
  const { data } = await apiClient.get('/api/transactions-page', {
    params: { page, limit, filter },
  });
  return normalizePaginatedTransactions(data);
};

export const fetchCases = async () => {
  const { data } = await apiClient.get('/api/cases');
  return normalizeCases(data);
};

export const fetchAuditTrail = async () => {
  const { data } = await apiClient.get('/api/audit-trail');
  return data; // { logs: [...], summary: {...} } — already clean from backend, no normalization needed
};

export const submitCaseReview = async (caseId, reviewPayload) => {
  const { data } = await apiClient.post(`/api/cases/${caseId}/review`, reviewPayload);
  return data;
};

export const fetchShapExplanation = async (features) => {
  const { data } = await apiClient.post('/api/shap', features);
  return normalizePrediction(data);
};

export const fetchRecentHistory = async () => {
  const { data } = await apiClient.get('/history');
  return normalizeCases(data);
};

export const submitPrediction = async (transactionData) => {
  const { data } = await apiClient.post('/predict', transactionData);
  return normalizePrediction(data);
};

export const uploadDatasetFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/api/upload-dataset', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};