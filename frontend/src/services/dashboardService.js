import api from "../api/axios";

export const getDashboardStats = async () => {
  const response = await api.get("/dashboard/analytics");
  return response.data;
};
