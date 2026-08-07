// import axios from "axios";

// const API =
// "http://127.0.0.1:8000/admin/notifications";

// export const getNotifications = async () => {

//     const response = await axios.get(API);

//     return response.data.notifications;

// };

// export const createNotification = async (data) => {

//     const response = await axios.post(

//         API,

//         data

//     );

//     return response.data;

// };

// export const deleteNotification = async (id) => {

//     const response = await axios.delete(

//         `${API}/${id}`

//     );

//     return response.data;

// };

import axios from "axios";

const API = "http://127.0.0.1:8000/admin/notifications";


// Get all notifications
export const getNotifications = async () => {

    const response = await axios.get(`${API}/`);

    return response.data;

};


// Send notification
export const sendNotification = async (notificationData) => {

    const response = await axios.post(
        `${API}/`,
        notificationData
    );

    return response.data;

};