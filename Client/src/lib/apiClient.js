import axios from 'axios';

const getToken = () => {
  // For development, you might want to store token in localStorage as fallback
  return localStorage.getItem('authToken');
};

const apiClient = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true, // This sends cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Add auth token to requests if available
apiClient.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;