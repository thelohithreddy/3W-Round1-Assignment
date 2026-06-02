import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    let message = error.response?.data?.message || error.message || 'Something went wrong';

    if (!error.response) {
      message = 'Cannot reach server. Check that the backend is running and VITE_API_BASE_URL is correct.';
    }

    if (status === 401 && onUnauthorized) {
      onUnauthorized(message);
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
