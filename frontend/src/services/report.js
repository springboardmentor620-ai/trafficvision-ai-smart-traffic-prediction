import api from "./api";

export const getTrafficReport = async () => {
    const response = await api.get("/reports/traffic");
    return response.data;
};

export const downloadPDF = async () => {
    try {
        const response = await api.get("/reports/traffic/pdf", {
            responseType: "blob",
        });
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `TrafficVision_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error("PDF blob download failed, falling back to window.open", err);
        const baseUrl = api.defaults.baseURL || "http://localhost:8000";
        window.open(`${baseUrl}/reports/traffic/pdf`, "_blank");
    }
};