import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function AdminUsers() {
  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>User Monitoring</h1>
        <p>View registered users and their activities.</p>
      </div>

      <Footer />
    </>
  );
}

export default AdminUsers;