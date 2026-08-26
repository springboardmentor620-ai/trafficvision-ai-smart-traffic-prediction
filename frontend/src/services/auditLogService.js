import api from "./api";


const AuditLogService = {

    async getActivity(limit = 100) {

        const response = await api.get(
            "/admin/activity",
            {
                params: {
                    limit
                }
            }
        );

        return response.data;

    }

};


export default AuditLogService;