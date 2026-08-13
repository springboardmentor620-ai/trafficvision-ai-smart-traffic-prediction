import api from "../api/axios";

export const getAnalytics = async () => {
  const response = await api.get("/analytics/overview");
  return response.data;
};
