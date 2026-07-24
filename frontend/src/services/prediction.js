import api from "./api";

export async function predictCongestion(data) {
  const response = await api.post("/prediction/predict", data);
  return response.data;
}