import Navbar from "../Navbar";
import Sidebar from "../Sidebar";

import DashboardLayout from "./DashboardLayout";
import DashboardHeader from "./DashboardHeader";

function AdminLayout({
  title,
  subtitle,
  children,
}) {
  return (
    <DashboardLayout
      navbar={<Navbar />}
      sidebar={<Sidebar />}
    >
      <DashboardHeader
        title={title}
        subtitle={subtitle}
      />

      {children}
    </DashboardLayout>
  );
}

export default AdminLayout;