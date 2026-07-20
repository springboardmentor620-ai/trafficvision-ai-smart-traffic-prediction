import axios from "axios";

const API = "http://127.0.0.1:8000/traffic";

export const getAreas = async () => {
    const response = await axios.get(`${API}/areas`);
    return response.data;
};

export const getAreaDetails = async (area) => {
    const response = await axios.get(`${API}/details/${area}`);
    return response.data;
};