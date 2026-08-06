import api from "../api/axios";

export const loginUser = async (userData) => {
    const response = await api.post("/auth/login", userData);
    return response.data;
};