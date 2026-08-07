import axios from "axios";

const API_URL = "http://127.0.0.1:8000/admin/alerts";


export const getAdminAlerts = async () => {

    const response = await axios.get(
        `${API_URL}/`
    );

    return response.data;
};


export const updateAlertStatus = async (
    alertId,
    status
) => {

    const response = await axios.put(
        `${API_URL}/${alertId}/status`,
        null,
        {
            params: {
                status: status
            }
        }
    );

    return response.data;
};


export const deleteAlert = async (alertId) => {

    const response = await axios.delete(
        `${API_URL}/${alertId}`
    );

    return response.data;
};