import api from "./api";


const UserService = {

    // =====================================================
    // GET ALL USERS
    // =====================================================

    async getAllUsers() {

        const response = await api.get("/users");

        return response.data;

    },


    // =====================================================
    // CHANGE USER ROLE
    // =====================================================

    async changeRole(userId, role) {

        const response = await api.patch(
            `/users/${userId}/role`,
            null,
            {
                params: {
                    role
                }
            }
        );

        return response.data;

    },


    // =====================================================
    // ACTIVATE USER
    // =====================================================

    async activateUser(userId) {

        const response = await api.patch(
            `/users/${userId}/activate`
        );

        return response.data;

    },


    // =====================================================
    // DEACTIVATE USER
    // =====================================================

    async deactivateUser(userId) {

        const response = await api.patch(
            `/users/${userId}/deactivate`
        );

        return response.data;

    }

};


export default UserService;