import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('greywater_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// System & Health
export const getHealth = async () => (await api.get('/health')).data;
export const getDashboardSummary = async () => (await api.get('/dashboard/summary')).data;

// Analysis
export const analyzeWater = async (sampleData) => (await api.post('/analysis', sampleData)).data;
export const analyzeBatch = async (formDataOrPayload) => {
  const isForm = formDataOrPayload instanceof FormData;
  return (await api.post('/analysis/batch', formDataOrPayload, {
    headers: isForm ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
  })).data;
};
export const getLatestAnalysis = async () => (await api.get('/analysis/latest')).data;
export const getAnalysisHistory = async (limit = 50) => (await api.get(`/analysis/history?limit=${limit}`)).data;
export const getAnalysisById = async (id) => (await api.get(`/analysis/${id}`)).data;

// Telemetry & Digital Twin
export const getLatestTelemetry = async () => (await api.get('/telemetry/latest')).data;
export const getTelemetryHistory = async (limit = 100) => (await api.get(`/telemetry/history?limit=${limit}`)).data;
export const startSimulation = async () => (await api.post('/simulation/start')).data;
export const stopSimulation = async () => (await api.post('/simulation/stop')).data;
export const resetSimulation = async () => (await api.post('/simulation/reset')).data;
export const stepSimulation = async (config = {}) => (await api.post('/simulation/step', config)).data;

// Domain Contexts
export const getLatestRouting = async () => (await api.get('/routing/latest')).data;
export const getLatestStorage = async () => (await api.get('/storage/latest')).data;
export const getLatestWeather = async () => (await api.get('/weather/latest')).data;
export const getReports = async () => (await api.get('/reports')).data;

// Auth
export const login = async (credentials) => (await api.post('/auth/login', credentials)).data;
export const register = async (userData) => (await api.post('/auth/register', userData)).data;
export const getMe = async () => (await api.get('/auth/me')).data;

export default api;
