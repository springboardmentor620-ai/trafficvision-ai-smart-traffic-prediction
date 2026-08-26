import api from "./api";


const AuthService = {

    async login(credentials) {

        const response = await api.post(
            "/auth/login",
            credentials
        );

        const data = response.data;


        /*
         * Store JWT access token.
         */

        if (data?.access_token) {

            localStorage.setItem(
                "token",
                data.access_token
            );

        }


        /*
         * Store complete user information
         * when provided by the backend.
         */

        if (data?.user) {

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

        }


        /*
         * Store the actual role returned
         * by the backend.
         */

        const role =
            data?.role ||
            data?.user?.role;

        if (role) {

            localStorage.setItem(
                "role",
                role
            );

        }


        return data;

    },


    async register(user) {

        const response = await api.post(
            "/auth/register",
            user
        );

        return response.data;

    },


    logout() {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        localStorage.removeItem("role");

    },


    isAuthenticated() {

        return Boolean(
            localStorage.getItem("token")
        );

    },


    getUser() {

        const user =
            localStorage.getItem("user");


        if (!user) {

            return null;

        }


        try {

            return JSON.parse(user);

        }

        catch {

            return null;

        }

    },


    getRole() {

        return localStorage.getItem("role");

    }

};


export default AuthService;