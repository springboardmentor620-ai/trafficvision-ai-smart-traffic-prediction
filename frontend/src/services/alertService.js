import api from "./api";

export async function createAlert(alert) {

    const response = await api.post(

        "/alerts/",

        alert,

        {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("access_token")}`
            }
        }

    );

    return response.data;

}

export async function getAlerts() {

    const response = await api.get(

        "/alerts/",

        {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("access_token")}`
            }
        }

    );

    return response.data;

}

export async function deleteAlert(id) {

    await api.delete(

        `/alerts/${id}`,

        {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("access_token")}`
            }
        }

    );

}