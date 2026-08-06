import api from "../api/axios";

export const getDashboardStats = async () => {

    const token = localStorage.getItem("token");

    const response = await api.get(
        "/dashboard/stats",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};