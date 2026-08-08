import api from "./api";

export const getTrafficReport = async () => {

    const response = await api.get("/reports/traffic");

    return response.data;

};

export const downloadPDF = () => {

    window.open(

        "http://127.0.0.1:8000/reports/traffic/pdf",

        "_blank"

    );

};