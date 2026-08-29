import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
