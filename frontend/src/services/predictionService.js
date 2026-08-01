import api from "./api";

const PredictionService = {

    async predict(data) {

        const response = await api.post(

            "/prediction",

            data

        );

        return response.data;

    }

};

export default PredictionService;