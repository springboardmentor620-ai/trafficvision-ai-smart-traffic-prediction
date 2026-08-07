import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const getHeatmapData = async () => {
  try {
    const response = await axios.get(`${API_URL}/heatmap/`);
    return response.data.locations;
  } catch (error) {
    console.error("Error loading heatmap:", error);
    return [];
  }
};