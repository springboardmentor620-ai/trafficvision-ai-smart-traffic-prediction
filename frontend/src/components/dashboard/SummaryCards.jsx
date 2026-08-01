import {
    FaCarCrash,
    FaBell,
    FaChartLine,
    FaMapMarkedAlt
} from "react-icons/fa";

import StatCard from "./StatCard";

function SummaryCards({ summary }) {

    if (!summary) {

        return <p>Loading...</p>;

    }

    return (

        <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-6">

            <StatCard
                title="Total Accidents"
                value={summary.total_accidents}
                color="text-blue-600"
                icon={<FaCarCrash />}
            />

            <StatCard
                title="Average Risk Score"
                value={summary.average_risk_score}
                color="text-green-600"
                icon={<FaChartLine />}
            />

            <StatCard
                title="Active Alerts"
                value={summary.active_alerts}
                color="text-red-500"
                icon={<FaBell />}
            />

            <StatCard
                title="Cities Covered"
                value={summary.total_cities}
                color="text-cyan-600"
                icon={<FaMapMarkedAlt />}
            />

        </div>

    );

}

export default SummaryCards;