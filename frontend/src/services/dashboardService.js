import axios from "axios";

const API = "http://127.0.0.1:8000/admin";

export const getDashboardStats = async () => {
  const response = await axios.get(`${API}/dashboard`);
  return response.data;
};