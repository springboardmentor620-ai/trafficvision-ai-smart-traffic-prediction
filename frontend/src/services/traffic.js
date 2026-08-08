import api from "./api";

export const getTrafficData = async () => {
  const response = await api.get("/traffic");
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await api.get("/analytics/summary");
  return response.data;
};

export const getCongestionAnalytics = async () => {
  const response = await api.get("/analytics/congestion");
  return response.data;
};

export const getBusiestRoads = async () => {
  const response = await api.get("/analytics/busiest");
  return response.data;
};

export const getFastestRoads = async () => {
  const response = await api.get("/analytics/fastest");
  return response.data;
};