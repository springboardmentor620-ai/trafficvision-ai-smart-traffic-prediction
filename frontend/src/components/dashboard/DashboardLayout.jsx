function DashboardLayout({ sidebar, navbar, children }) {
  return (
    <>
      {navbar}

      <div
        style={{
          display: "flex",
          background: "#f4f7fb",
          minHeight: "100vh",
        }}
      >
        {sidebar}

        <main
          style={{
            flex: 1,
            padding: "30px",
            overflow: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </>
  );
}

export default DashboardLayout;