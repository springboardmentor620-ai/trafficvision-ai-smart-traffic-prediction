import api from "./api";


const SystemControlService = {

    async getControls() {

        const response = await api.get(
            "/system-controls"
        );

        return response.data;

    },


    async updateControls(updates) {

        const response = await api.patch(
            "/system-controls",
            updates
        );

        return response.data;

    }

};


export default SystemControlService;