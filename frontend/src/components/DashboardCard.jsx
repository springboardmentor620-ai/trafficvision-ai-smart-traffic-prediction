function DashboardCard({ title, value, color }) {

    return (

        <div
            style={{
                flex: "1",
                minWidth: "220px",
                background: "linear-gradient(135deg,#ffffff,#f8fafc)",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 12px 30px rgba(0,0,0,.08)",
                borderLeft: `8px solid ${color}`,
                transition: "all .35s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(37,99,235,.18)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(0,0,0,.08)";
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: "-35px",
                    right: "-35px",
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    background: color,
                    opacity: 0.12
                }}
            />

            <h4
                style={{
                    color: "#6b7280",
                    marginBottom: "18px",
                    fontWeight: "600",
                    fontSize: "17px",
                    position: "relative"
                }}
            >
                {title}
            </h4>

            <h1
                style={{
                    color: color,
                    margin: 0,
                    fontSize: "44px",
                    fontWeight: "700",
                    position: "relative"
                }}
            >
                {value}
            </h1>
        </div>

    );

}

export default DashboardCard;