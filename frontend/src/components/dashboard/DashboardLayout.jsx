import Navbar from "../Navbar";
import Sidebar from "../Sidebar";

function DashboardLayout({ sidebar, navbar, children }) {
  const navElement = navbar !== undefined ? navbar : <Navbar />;
  const sideElement = sidebar !== undefined ? sidebar : <Sidebar />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-page)" }}>
      {navElement}

      <div
        style={{
          display: "flex",
          flex: 1,
          backgroundColor: "var(--bg-page)",
          color: "var(--text-primary)",
          position: "relative",
          minHeight: "calc(100vh - 70px)",
        }}
      >
        {sideElement}

        <main
          style={{
            flex: 1,
            padding: "28px 32px",
            overflowX: "hidden",
            overflowY: "auto",
            backgroundColor: "var(--bg-page)",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            width: "100%",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;