import api from "./api";

export const getZones = async () => {
  const response = await api.get("/zones/");
  return response.data;
};

export const createZone = async (zone) => {
  const response = await api.post("/zones/", zone);
  return response.data;
};

export const updateZone = async (id, zone) => {
  const response = await api.put(`/zones/${id}`, zone);
  return response.data;
};

export const deleteZone = async (id) => {
  const response = await api.delete(`/zones/${id}`);
  return response.data;
};