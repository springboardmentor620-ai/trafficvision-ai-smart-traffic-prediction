import api from "../api/axios";

export const predictTraffic = async (params) => {
  const response = await api.post("/prediction/predict", params);
  return response.data;
};

export const getPredictionHistory = async (limit = 10) => {
  const response = await api.get("/prediction/history", { params: { limit } });
  return response.data;
};
