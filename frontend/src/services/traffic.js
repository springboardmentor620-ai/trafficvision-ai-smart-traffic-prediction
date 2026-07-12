import api from "./api";

export async function getTraffic() {
  const response = await api.get("/traffic");
  return response.data;
}