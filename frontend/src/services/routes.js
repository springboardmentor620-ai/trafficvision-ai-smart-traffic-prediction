import api from "./api";

export const optimizeRoute = async (

    source,

    destination,

) => {

    const response = await api.get(

        "/routes/optimize",

        {

            params: {

                source,

                destination,

            },

        }

    );

    return response.data;

};