import axios from "axios";

const API_KEY = import.meta.env.VITE_ORS_API_KEY;

const BASE_URL =
  "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

export const getRoute = async (start, end) => {
  try {
    const response = await axios.post(
      BASE_URL,
      {
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ],
      },
      {
        headers: {
          Authorization: API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Route API Error:", error);
    return null;
  }
};