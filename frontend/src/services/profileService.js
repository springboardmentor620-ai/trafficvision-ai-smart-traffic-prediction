import api from "../api/axios";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

// Get Profile
export const getProfile = async () => {

    const response = await api.get(
        "/profile/",
        headers()
    );

    return response.data;
};

// Update Profile
export const updateProfile = async (profile) => {

    const response = await api.put(
        "/profile/update",
        profile,
        headers()
    );

    return response.data;
};

// Change Password
export const changePassword = async (passwords) => {

    const response = await api.put(
        "/profile/change-password",
        passwords,
        headers()
    );

    return response.data;
};