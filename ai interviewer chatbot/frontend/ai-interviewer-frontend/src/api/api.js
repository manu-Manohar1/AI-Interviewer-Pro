import axios from "axios";

// REACT_APP_API_URL lets each environment (local dev, Vercel preview,
// Vercel production) point at a different backend without editing source.
// Falls back to the known production Render URL if the env var isn't set,
// so nothing breaks if it's missing -- but you should set
// REACT_APP_API_URL in Vercel's project settings going forward.
const baseURL =
  process.env.REACT_APP_API_URL || "https://ai-interviewer-pro-yhvk.onrender.com/api/v1";

const api = axios.create({
  baseURL,
  // Without a timeout, a sleeping Render free-tier instance (or any dead
  // connection) leaves the request pending indefinitely -- the UI just
  // spins forever with no error and no way out. 30s is generous enough to
  // cover a cold start but still gives the user feedback instead of an
  // infinite spinner.
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
