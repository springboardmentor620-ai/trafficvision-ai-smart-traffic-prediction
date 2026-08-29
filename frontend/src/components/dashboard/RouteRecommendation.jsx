function RouteRecommendation({
    locations = [],
    origin,
    destination
}) {
    if (
        !locations ||
        !locations.length ||
        !origin ||
        !destination ||
        !origin.input ||
        !destination.input
    ) {
        return (
            <div
                style={{
                    marginTop: 20,
                    padding: 20,
                    borderRadius: 14,
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "var(--shadow-sm)"
                }}
            >
                <h2 style={{ color: "var(--primary)", fontSize: "18px", marginBottom: "8px" }}>🤖 AI Route Recommendation</h2>
                <hr style={{ marginBottom: "12px" }} />
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                    Select an <strong>Origin</strong> and <strong>Destination</strong> then click <strong>Find Best Route</strong> to generate an AI recommendation.
                </p>
            </div>
        );
    }

    const estimatedTime = Math.round(
        (
            (origin.input?.Traffic_Volume || 15000) +
            (destination.input?.Traffic_Volume || 15000)
        ) / 2000 +
        (
            (origin.prediction || 35) +
            (destination.prediction || 35)
        ) / 15
    );

    const delay = Math.round(
        (
            origin.prediction +
            destination.prediction
        ) / 25
    );

    const avgPrediction =
        (
            origin.prediction +
            destination.prediction
        ) / 2;

    let congestion = "🟢 Low";
    if (avgPrediction >= 70)
        congestion = "🔴 Heavy";
    else if (avgPrediction >= 40)
        congestion = "🟠 Moderate";

    let stars = 5;
    if (avgPrediction >= 80)
        stars = 1;
    else if (avgPrediction >= 60)
        stars = 2;
    else if (avgPrediction >= 40)
        stars = 3;
    else if (avgPrediction >= 20)
        stars = 4;

    return (
        <div
            style={{
                margin: "30px auto",
                padding: "30px",
                maxWidth: "900px",
                borderRadius: "14px",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-sm)"
            }}
        >
            <h2
                style={{
                    color: "var(--primary)",
                    fontSize: "20px",
                    marginBottom: "12px",
                }}
            >
                🤖 AI Route Recommendation
            </h2>

            <hr style={{ marginBottom: "16px" }} />

            <h3 style={{ color: "var(--text-primary)", fontSize: "18px" }}>
                {origin.name}
                {"  →  "}
                {destination.name}
            </h3>

            <br />

            <p style={{ color: "var(--text-secondary)", fontWeight: "600" }}>
                Recommended Route
            </p>

            <br />

            <div
                style={{
                    lineHeight: "2",
                    fontSize: "16px",
                    textAlign: "center",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    padding: "16px",
                    background: "var(--bg-surface-secondary)",
                    borderRadius: "10px",
                    border: "1px solid var(--border-color)",
                }}
            >
                🚩 {origin.name}
                <br/>
                ⬇
                <br/>
                🛣 {origin.input.Road_Intersection_Name}
                <br/>
                ⬇
                <br/>
                🛣 {destination.input.Road_Intersection_Name}
                <br/>
                ⬇
                <br/>
                🏁 {destination.name}
            </div>

            <hr style={{ margin: "20px 0" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "15px" }}>
                <p>
                    <strong>Estimated Travel Time :</strong> {estimatedTime} mins
                </p>

                <p>
                    <strong>Expected Delay :</strong> {delay} mins
                </p>

                <p>
                    <strong>Predicted Congestion :</strong> {congestion}
                </p>

                <p>
                    <strong>Route Quality :</strong> {"⭐".repeat(stars)}{"☆".repeat(5 - stars)}
                </p>
            </div>

            <hr style={{ margin: "20px 0" }} />

            <h4
                style={{
                    color: "var(--primary)",
                    marginBottom: "10px",
                    fontSize: "16px",
                }}
            >
                💡 AI Recommendation Details
            </h4>

            <ul style={{ lineHeight: "1.8", color: "var(--text-secondary)", fontSize: "14px" }}>
                <li>
                    Recommended travel from <strong>{origin.name}</strong> to <strong>{destination.name}</strong>.
                </li>
                <li>
                    Average congestion is <strong>{avgPrediction.toFixed(2)}%</strong>.
                </li>
                <li>
                    Expected delay is <strong>{delay} minutes</strong>.
                </li>
            </ul>
        </div>
    );
}

export default RouteRecommendation;