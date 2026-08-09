import api from "./api";

const AuthService = {

    async login(credentials) {

        const response = await api.post(

            "/auth/login",

            credentials

        );

        const data = response.data;

        /*
         * Store the authentication token.
         */

        if (data?.access_token) {

            localStorage.setItem(

                "token",

                data.access_token

            );

        }

        /*
         * Some backend responses may include
         * user information or role.
         *
         * We store it only if it actually exists.
         * No dummy role is created.
         */

        if (data?.user) {

            localStorage.setItem(

                "user",

                JSON.stringify(data.user)

            );

        }

        if (data?.role) {

            localStorage.setItem(

                "role",

                data.role

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