import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const apiService = {
  // Check API & Model health
  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Single student inference
  predictStudent: async (studentData) => {
    const response = await apiClient.post('/api/v1/predict', studentData);
    return response.data;
  },

  // Batch students inference
  predictBatch: async (studentsList) => {
    const response = await apiClient.post('/api/v1/predict/batch', { students: studentsList });
    return response.data;
  },

  // CSV file upload
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/v1/predict/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Model Metadata & Governance
  getModelMetadata: async () => {
    const response = await apiClient.get('/api/v1/model/metadata');
    return response.data;
  },

  // MLOps Real-time Logs
  getMonitoringLogs: async (limit = 20) => {
    const response = await apiClient.get(`/api/v1/monitoring/logs?limit=${limit}`);
    return response.data;
  },

  // MLOps Analytics Summary
  getMonitoringSummary: async () => {
    const response = await apiClient.get('/api/v1/monitoring/summary');
    return response.data;
  },
};
