import api from "../api/axios";

export const getProfile = async () => {
  const response = await api.get("/profile/");
  return response.data;
};

export const updateProfile = async (profile) => {
  const response = await api.put("/profile/update", profile);
  return response.data;
};

export const changePassword = async (passwords) => {
  const response = await api.put("/profile/change-password", passwords);
  return response.data;
};
