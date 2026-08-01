import {

    FaFileAlt,

    FaDownload,

    FaDatabase,

    FaHistory

} from "react-icons/fa";

import StatCard from "../ui/StatCard";

function ReportStats() {

    return (

        <div className="grid lg:grid-cols-4 gap-6">

            <StatCard

                title="Reports"

                value="0"

                icon={<FaFileAlt />}

            />

            <StatCard

                title="Downloads"

                value="0"

                icon={<FaDownload />}

                color="text-green-600"

            />

            <StatCard

                title="Prediction History"

                value="0"

                icon={<FaHistory />}

                color="text-yellow-600"

            />

            <StatCard

                title="Database"

                value="Connected"

                icon={<FaDatabase />}

                color="text-cyan-600"

            />

        </div>

    );

}

export default ReportStats;