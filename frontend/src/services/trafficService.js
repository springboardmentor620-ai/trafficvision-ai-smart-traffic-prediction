import api from "../api/axios";

export const getAllTraffic = async () => {
  const response = await api.get("/traffic/");
  return response.data;
};

export const addTraffic = async (traffic) => {
  const response = await api.post("/traffic/", traffic);
  return response.data;
};

export const updateTraffic = async (id, traffic) => {
  const response = await api.put(`/traffic/${id}`, traffic);
  return response.data;
};

export const deleteTraffic = async (id) => {
  const response = await api.delete(`/traffic/${id}`);
  return response.data;
};
