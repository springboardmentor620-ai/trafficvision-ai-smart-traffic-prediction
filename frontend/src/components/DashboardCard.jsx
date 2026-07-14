function DashboardCard({ title, value, color }) {
    return (
        <div
            style={{
                background: "white",
                borderLeft: `6px solid ${color}`,
                borderRadius: "12px",
                padding: "20px",
                width: "220px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                transition: "0.3s",
                cursor: "pointer"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            <h4
                style={{
                    margin: 0,
                    color: "#666"
                }}
            >
                {title}
            </h4>

            <h1
                style={{
                    marginTop: "15px",
                    color: color
                }}
            >
                {value}
            </h1>
        </div>
    );
}

export default DashboardCard;