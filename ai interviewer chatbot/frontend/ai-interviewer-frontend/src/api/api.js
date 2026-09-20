import axios from 'axios';

// Uses Vercel environment variable if available, otherwise falls back to your Render URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ai-interviewer-pro-yhvk.onrender.com/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data?.detail || 'An unexpected network error occurred.');
    }
);

export default api;
