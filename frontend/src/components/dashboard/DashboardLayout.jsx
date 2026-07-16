function DashboardLayout({ sidebar, navbar, children }) {
  return (
    <>
      {navbar}

      <div
        style={{
          display: "flex",
          minHeight: "calc(100vh - 70px)",
        }}
      >
        {sidebar}

        <main
          style={{
            flex: 1,
            padding: "24px",
            background: "#f5f7fb",
          }}
        >
          {children}
        </main>
      </div>
    </>
  );
}

export default DashboardLayout;