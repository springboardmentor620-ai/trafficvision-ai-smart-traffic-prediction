import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function AdminReports() {
  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>Reports</h1>
        <p>This page will display generated reports.</p>
      </div>

      <Footer />
    </>
  );
}

export default AdminReports;