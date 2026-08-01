import DashboardLayout from "../../components/layout/DashboardLayout";

import ReportHeader from "../../components/reports/ReportHeader";

import ReportStats from "../../components/reports/ReportStats";

import ExportButtons from "../../components/reports/ExportButtons";

function Reports() {

    return (

        <DashboardLayout>

            <ReportHeader />

            <ReportStats />

            <div className="mt-8">

                <ExportButtons />

            </div>

        </DashboardLayout>

    );

}

export default Reports;