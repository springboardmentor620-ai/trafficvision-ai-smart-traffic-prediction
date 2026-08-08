import api from "./api";

export const getRoads = async () => {
  const response = await api.get("/roads/");
  return response.data;
};

export const createRoad = async (road) => {
  const response = await api.post("/roads/", road);
  return response.data;
};

export const updateRoad = async (id, road) => {
  const response = await api.put(`/roads/${id}`, road);
  return response.data;
};

export const deleteRoad = async (id) => {
  const response = await api.delete(`/roads/${id}`);
  return response.data;
};