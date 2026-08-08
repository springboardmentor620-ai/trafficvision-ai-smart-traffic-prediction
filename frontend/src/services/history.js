import api from "./api";

export const getHistory = async () => {

    const response = await api.get("/history/");

    return response.data;

};

export const getHistorySummary = async () => {

    const response = await api.get("/history/summary");

    return response.data;

};

export const getHistoryDistribution = async () => {

    const response = await api.get("/history/distribution");

    return response.data;

};