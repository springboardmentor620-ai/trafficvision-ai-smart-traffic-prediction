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

    const [endpointErrors, setEndpointErrors] = useState([]);

    useEffect(() => {

        let mounted = true;

        async function loadDashboard() {

            setLoading(true);

            setError(null);

            const requests = [

                {
                    name: "summary",
                    request: DashboardService.getSummary
                },

                {
                    name: "monthlyTrend",
                    request: DashboardService.getMonthlyTrend
                },

                {
                    name: "severityDistribution",
                    request: DashboardService.getSeverityDistribution
                },

                {
                    name: "weatherDistribution",
                    request: DashboardService.getWeatherDistribution
                },

                {
                    name: "dangerousCities",
                    request: DashboardService.getDangerousCities
                },

                {
                    name: "heatmap",
                    request: DashboardService.getHeatmap
                }

            ];

            const results =
                await Promise.allSettled(

                    requests.map(
                        (item) => item.request()
                    )

                );

            if (!mounted) return;

            const failedRequests = [];

            results.forEach(
                (result, index) => {

                    const requestName =
                        requests[index].name;

                    if (
                        result.status === "fulfilled"
                    ) {

                        const data =
                            result.value;

                        switch (requestName) {

                            case "summary":

                                setSummary(data);

                                break;

                            case "monthlyTrend":

                                setMonthlyTrend(
                                    Array.isArray(data)
                                        ? data
                                        : []
                                );

                                break;

                            case "severityDistribution":

                                setSeverityDistribution(
                                    Array.isArray(data)
                                        ? data
                                        : []
                                );

                                break;

                            case "weatherDistribution":

                                setWeatherDistribution(
                                    Array.isArray(data)
                                        ? data
                                        : []
                                );

                                break;

                            case "dangerousCities":

                                setDangerousCities(
                                    Array.isArray(data)
                                        ? data
                                        : []
                                );

                                break;

                            case "heatmap":

                                setHeatmapData(
                                    Array.isArray(data)
                                        ? data
                                        : []
                                );

                                break;

                            default:

                                break;

                        }

                    }
                    else {

                        console.error(
                            `Dashboard ${requestName} failed:`,
                            result.reason
                        );

                        failedRequests.push(
                            requestName
                        );

                    }

                }
            );

            setEndpointErrors(
                failedRequests
            );

            /*
             * Only show the main error when the
             * essential dashboard summary itself
             * cannot be loaded.
             */

            const summaryResult =
                results[0];

            if (
                summaryResult.status ===
                "rejected"
            ) {

                setError(
                    summaryResult.reason
                );

            }

            setLoading(false);

        }

        loadDashboard();

        return () => {

            mounted = false;

        };

    }, []);

    return {

        summary,

        monthlyTrend,

        severityDistribution,

        weatherDistribution,

        dangerousCities,

        heatmapData,

        loading,

        error,

        endpointErrors

    };

}

export default useDashboard;