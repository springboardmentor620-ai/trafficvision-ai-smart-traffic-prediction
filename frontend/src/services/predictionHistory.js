import api from "./api";

export async function getPredictionHistory() {
    const response = await api.get("/prediction-history/");
    return response.data;
}