import api from "../api/axios";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

export const getAllTraffic = async () => {

    const response = await api.get(
        "/traffic/",
        headers()
    );

    return response.data;
};

export const addTraffic = async (traffic) => {

    const response = await api.post(
        "/traffic/",
        traffic,
        headers()
    );

    return response.data;
};

export const updateTraffic = async (id, traffic) => {

    const response = await api.put(
        `/traffic/${id}`,
        traffic,
        headers()
    );

    return response.data;
};

export const deleteTraffic = async (id) => {

    const response = await api.delete(
        `/traffic/${id}`,
        headers()
    );

    return response.data;
};