import axios from "axios";

// Vercel Environment Variable
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://ai-interviewer-pro-yhvk.onrender.com/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/login");
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;
