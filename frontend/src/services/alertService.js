import api from "./api";

// Note: there is no createAlert()/POST /alerts endpoint by design -
// alerts are generated automatically by the backend whenever a
// prediction is made (see traffic_alert_service.generate_alert_for_prediction).
// This file previously exported a createAlert() that posted to a route
// which doesn't exist server-side; it was unused and has been removed.

export async function getAlerts({ severity, category, search } = {}) {

    const params = {};
    if (severity) params.severity = severity;
    if (category) params.category = category;
    if (search) params.search = search;

    const response = await api.get(

        "/alerts/",

        {
            params,
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

// Backs the notification panel. Polled every 30s by the frontend instead
// of a WebSocket connection - see NotificationPanel.jsx.
export async function getUnreadAlerts() {

    const response = await api.get(

        "/alerts/unread",

        {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("access_token")}`
            }
        }

    );

    return response.data;

}

export async function markAlertRead(id) {

    const response = await api.post(

        `/alerts/mark-read/${id}`,

        {},

        {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("access_token")}`
            }
        }

    );

    return response.data;

}