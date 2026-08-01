import DashboardLayout from "../../components/layout/DashboardLayout";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import SummaryCards from "../../components/dashboard/SummaryCards";
import TrafficTrendChart from "../../components/dashboard/TrafficTrendChart";
import SeverityChart from "../../components/dashboard/SeverityChart";
import WeatherChart from "../../components/dashboard/WeatherChart";
import DangerousCities from "../../components/dashboard/DangerousCities";
import HeatmapPreview from "../../components/dashboard/HeatmapPreview";
import RecentPredictions from "../../components/dashboard/RecentPredictions";
import AlertPanel from "../../components/dashboard/AlertPanel";

import useDashboard from "../../hooks/useDashboard";

function Dashboard() {

    const {

        summary,

        monthlyTrend,

        severityDistribution,

        weatherDistribution,

        dangerousCities,

        heatmapData,

        loading,

        error

    } = useDashboard();

    if (loading) {

        return <h2 className="text-center mt-20">Loading Dashboard...</h2>;

    }

    if (error) {

        return <h2 className="text-center mt-20 text-red-600">Failed to load dashboard.</h2>;

    }

    return (

        <DashboardLayout>

            <DashboardHeader />

            <SummaryCards summary={summary} />

            <div className="grid lg:grid-cols-2 gap-8 mt-8">

                <TrafficTrendChart data={monthlyTrend} />

                <SeverityChart data={severityDistribution} />

            </div>

            <div className="mt-8">

                <WeatherChart data={weatherDistribution} />

            </div>

            <div className="grid lg:grid-cols-2 gap-8 mt-8">

                <DangerousCities

                    data={dangerousCities}

                />

                <HeatmapPreview

                    data={heatmapData}

                />

            </div>

            <div className="grid lg:grid-cols-2 gap-8 mt-8">

                <RecentPredictions />

                <AlertPanel />

            </div>

        </DashboardLayout>

    );

}

export default Dashboard;