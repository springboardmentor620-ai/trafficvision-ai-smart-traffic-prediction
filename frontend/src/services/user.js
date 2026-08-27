import api from "./api";

export async function getCurrentUser() {
  const response = await api.get("/me");
  return response.data;
}

export async function getUsers(search = "", role = "") {
  const params = {};
  if (search) params.search = search;
  if (role && role !== "All") params.role = role;

  const response = await api.get("/admin/users", { params });
  return response.data;
}

export async function getUserStats() {
  const response = await api.get("/admin/users/stats");
  return response.data;
}

export async function createUser(userData) {
  const response = await api.post("/admin/users", userData);
  return response.data;
}

export async function updateUser(userId, userData) {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
}

export async function deleteUser(userId) {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
}