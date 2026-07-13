function DashboardCard({ title, value, color }) {
    return (
        <div
            style={{
                backgroundColor: color,
                color: "white",
                padding: "20px",
                borderRadius: "10px",
                width: "220px",
                boxShadow: "0px 3px 10px rgba(0,0,0,0.2)"
            }}
        >
            <h3>{title}</h3>

            <h1>{value}</h1>
        </div>
    );
}

export default DashboardCard;