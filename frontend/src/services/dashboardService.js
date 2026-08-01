import api from "./api";

const DashboardService = {

    async getSummary() {

        const response = await api.get(
            "/dashboard/summary"
        );

        return response.data;

    },

    async getMonthlyTrend() {

        const response = await api.get(
            "/dashboard/monthly-trend"
        );

        return response.data;

    },

    async getSeverityDistribution() {

        const response = await api.get(
            "/dashboard/severity-distribution"
        );

        return response.data;

    },

    async getWeatherDistribution() {

        const response = await api.get(
            "/dashboard/weather-distribution"
        );

        return response.data;

    },

    async getDangerousCities() {

        const response = await api.get(
            "/dashboard/dangerous-cities"
        );

        return response.data;

    },

    async getHeatmap() {

        const response = await api.get(
            "/dashboard/heatmap"
        );

        return response.data;

    }

};

export default DashboardService;