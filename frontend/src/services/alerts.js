import api from "./api";

export const getAlerts = async () => {
  const response = await api.get("/alerts");
  return response.data;
};

export const resolveAlert = async (id) => {
    const response = await api.put(
        `/alerts/${id}/resolve`
    );
    return response.data;
};