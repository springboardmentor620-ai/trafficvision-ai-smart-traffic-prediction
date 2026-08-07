import axios from "axios";

const API = "http://127.0.0.1:8000/prediction-history";

export const getPredictionHistory = async () => {

    const response = await axios.get(`${API}/`);

    return response.data.history;

};