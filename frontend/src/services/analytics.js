import api from "./api";

export async function getDashboardSummary() {
  const response = await api.get("/analytics/summary");
  return response.data;
}

export async function getCongestionChart() {
  const response = await api.get("/analytics/congestion");
  return response.data;
}

export async function getBusiestRoads() {
  const response = await api.get("/analytics/busiest");
  return response.data;
}

export async function getFastestRoads() {
  const response = await api.get("/analytics/fastest");
  return response.data;
}

export const getTrafficTrend = async () => {
    const response = await api.get("/analytics/trend");
    return response.data;
};

export const getAIInsights = async () => {
    const response = await api.get("/analytics/insights");
    return response.data;
};