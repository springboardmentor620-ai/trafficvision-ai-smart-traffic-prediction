import { useEffect, useState } from "react";
import DashboardService from "../services/dashboardService";

function useDashboard() {

    const [summary, setSummary] = useState(null);

    const [monthlyTrend, setMonthlyTrend] = useState([]);

    const [severityDistribution, setSeverityDistribution] = useState([]);

    const [weatherDistribution, setWeatherDistribution] = useState([]);

    const [dangerousCities, setDangerousCities] = useState([]);

    const [heatmapData, setHeatmapData] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {

        async function loadDashboard() {

            try {

                const [

                    summary,

                    trend,

                    severity,

                    weather,

                    cities,

                    heatmap

                ] = await Promise.all([

                    DashboardService.getSummary(),

                    DashboardService.getMonthlyTrend(),

                    DashboardService.getSeverityDistribution(),

                    DashboardService.getWeatherDistribution(),

                    DashboardService.getDangerousCities(),

                    DashboardService.getHeatmap()

                ]);

                setSummary(summary);

                setMonthlyTrend(trend);

                setSeverityDistribution(severity);

                setWeatherDistribution(weather);

                setDangerousCities(cities);

                setHeatmapData(heatmap);

            }

            catch (err) {

                console.error(err);

                setError(err);

            }

            finally {

                setLoading(false);

            }

        }

        loadDashboard();

    }, []);

    return {

        summary,

        monthlyTrend,

        severityDistribution,

        weatherDistribution,

        dangerousCities,

        heatmapData,

        loading,

        error

    };

}

export default useDashboard;