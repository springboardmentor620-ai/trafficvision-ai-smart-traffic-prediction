import api from "./api";

async function testRoute() {
    try {
        const response = await api.post("/routes/", {
            source_lat: 23.2518,
            source_lng: 77.5265,
            destination_lat: 23.2075,
            destination_lng: 77.4660
        });

        console.log("✅ FRONTEND ROUTE TEST SUCCESS");
        console.log("STATUS:", response.status);
        console.log("DATA:", response.data);

    } catch (error) {

        console.error("❌ FRONTEND ROUTE TEST FAILED");
        console.error("MESSAGE:", error.message);
        console.error("STATUS:", error.response?.status);
        console.error("DATA:", error.response?.data);
        console.error("URL:", error.config?.url);
    }
}

export default testRoute;