import api from "../api/axios";

/**
 * Predict traffic volume and congestion level for a junction
 * @param {Object} params - { junction, hour, day, month, weekday }
 */
export const predictTraffic = async (params) => {
  const response = await api.post("/traffic/predict", params);
  return response.data;
};
