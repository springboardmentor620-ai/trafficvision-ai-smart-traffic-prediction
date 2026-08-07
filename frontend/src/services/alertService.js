// import axios from "axios";

// const API = "http://127.0.0.1:8000";

// /*
// ----------------------------------------
// Get all saved alerts
// ----------------------------------------
// */
// export const getAlerts = async () => {

//   const response = await axios.get(
//     `${API}/alerts`
//   );

//   return response.data.alerts;

// };

// /*
// ----------------------------------------
// Get one alert by id (optional)
// ----------------------------------------
// */
// export const getAlert = async (id) => {

//   const response = await axios.get(
//     `${API}/alerts/${id}`
//   );

//   return response.data;

// };

// /*
// ----------------------------------------
// Delete alert (optional)
// ----------------------------------------
// */
// export const deleteAlert = async (id) => {

//   const response = await axios.delete(
//     `${API}/alerts/${id}`
//   );

//   return response.data;

// };

import axios from "axios";

const API = "http://127.0.0.1:8000/alerts";

// ----------------------------
// Get All Alerts
// ----------------------------

export const getAlerts = async () => {

    const response = await axios.get(`${API}/`);

    return response.data.alerts;

};

// ----------------------------
// Resolve Alert
// ----------------------------

export const resolveAlert = async (id) => {

    const response = await axios.put(
        `${API}/${id}/resolve`
    );

    return response.data;

};

// ----------------------------
// Edit Alert
// ----------------------------

export const updateAlert = async (id, payload) => {

    const response = await axios.put(
        `${API}/${id}`,
        payload
    );

    return response.data;

};

// ----------------------------
// Delete Alert
// ----------------------------

export const deleteAlert = async (id) => {

    const response = await axios.delete(
        `${API}/${id}`
    );

    return response.data;

};