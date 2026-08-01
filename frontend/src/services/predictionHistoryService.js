import api from "./api";

const PredictionHistoryService = {

    async getHistory(page = 1, limit = 5) {

        const response = await api.get(

            `/history?page=${page}&limit=${limit}`

        );

        return response.data;

    }

};

export default PredictionHistoryService;