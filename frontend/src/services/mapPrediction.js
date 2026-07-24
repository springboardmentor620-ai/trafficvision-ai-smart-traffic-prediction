import api from "./api";

export async function predictLocation(data) {

    try {

        const response = await api.post(
            "/prediction/predict",
            data
        );

        return response.data;

    }

    catch (error) {

        console.log("Prediction Error:");

        console.log(error.response.data);

        throw error;

    }

}