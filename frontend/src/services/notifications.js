import api from "./api";

export const getNotifications = async () => {
  const response = await api.get("/notifications/");
  return response.data;
};

export const markNotificationRead = async (id) => {
  await api.put(`/notifications/${id}/read`);
};

export const deleteNotification = async (id) => {
  await api.delete(`/notifications/${id}`);
};

export const createNotification = async (notification) => {
  const response = await api.post("/notifications/", notification);
  return response.data;
};