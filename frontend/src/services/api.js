import axios from 'axios';
import logger from '../utils/logger';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache for inflight requests to prevent duplicates
const inflightRequests = new Map();

// Helper to generate a unique key for a request
const getRequestKey = (config) => `${config.method}:${config.url}:${JSON.stringify(config.params || {})}:${JSON.stringify(config.data || {})}`;

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // 1. Add Token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Prevent Duplicate Requests (for GET only to be safe)
    if (config.method === 'get') {
      const key = getRequestKey(config);
      if (inflightRequests.has(key)) {
        const controller = new AbortController();
        config.signal = controller.signal;
        controller.abort('Duplicate request prevented');
      } else {
        inflightRequests.set(key, true);
      }
    }

    return config;
  },
  (error) => {
    logger.error('Request Interceptor Error', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Remove from inflight cache
    if (response.config.method === 'get') {
      inflightRequests.delete(getRequestKey(response.config));
    }
    logger.api(response.config.method, response.config.url, response.status);
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // Remove from inflight cache
    if (config && config.method === 'get') {
      inflightRequests.delete(getRequestKey(config));
    }

    // 1. Network / Retry Logic
    if (!response || (response.status >= 500 && response.status <= 504)) {
      config._retryCount = config._retryCount || 0;
      
      if (config._retryCount < 2) {
        config._retryCount += 1;
        logger.warn(`Retrying request (${config._retryCount}/2)...`, config.url);
        
        // Exponential backoff
        const backoff = Math.pow(2, config._retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoff));
        return api(config);
      }
    }

    // 2. Global Error Handling
    if (response) {
      logger.api(config.method, config.url, response.status, error);
      
      if (response.status === 401) {
        if (window.location.pathname !== '/') {
          localStorage.clear();
          window.location.href = '/?session=expired';
        }
      }
    } else if (axios.isCancel(error)) {
      logger.info('Request canceled', error.message);
    } else {
      logger.error('API_NETWORK_FAILURE', error);
    }

    return Promise.reject(error);
  }
);

export default api;
