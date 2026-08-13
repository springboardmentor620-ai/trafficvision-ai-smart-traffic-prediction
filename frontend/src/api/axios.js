import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
  timeout: 30000, // was 15000 — analytics endpoints do heavy aggregation; raised while the backend queries below are optimized
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("name");
      localStorage.removeItem("role");
      localStorage.removeItem("assigned_junction");

      if (window.location.pathname !== "/" && window.location.pathname !== "/register") {
        window.location.replace("/");
      }
    }

    return Promise.reject(error);
  }
);

export default api;