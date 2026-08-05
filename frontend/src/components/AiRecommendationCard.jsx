import PropTypes from "prop-types";

function AIRecommendationCard({ data }) {

    if (!data) {
        return null;
    }

    return (
        <div
            style={{
                background: "linear-gradient(135deg,#111827,#1f2937)",
                color: "white",
                borderRadius: "18px",
                padding: "28px",
                boxShadow: "0 10px 25px rgba(0,0,0,.2)"
            }}
        >
            <h2 style={{ margin: "0 0 20px" }}>
                🤖 AI Recommendation
            </h2>

            <p style={{ margin: "0 0 18px", fontSize: "16px", opacity: 0.9 }}>
                {data.traffic_status}
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                    gap: "16px",
                    marginBottom: "22px"
                }}
            >
                <div>
                    <p style={{ margin: 0, opacity: 0.7, fontSize: "13px" }}>
                        Recommended Route
                    </p>
                    <p style={{ margin: "4px 0 0", fontWeight: "700", fontSize: "17px" }}>
                        🛣️ {data.recommended_route}
                    </p>
                </div>

                <div>
                    <p style={{ margin: 0, opacity: 0.7, fontSize: "13px" }}>
                        Estimated Delay
                    </p>
                    <p style={{ margin: "4px 0 0", fontWeight: "700", fontSize: "17px" }}>
                        ⏱ {data.estimated_delay} minutes
                    </p>
                </div>

                <div>
                    <p style={{ margin: 0, opacity: 0.7, fontSize: "13px" }}>
                        Suggested Departure
                    </p>
                    <p style={{ margin: "4px 0 0", fontWeight: "700", fontSize: "17px" }}>
                        🕒 {data.suggested_departure}
                    </p>
                </div>

                <div>
                    <p style={{ margin: 0, opacity: 0.7, fontSize: "13px" }}>
                        Confidence
                    </p>
                    <p style={{ margin: "4px 0 0", fontWeight: "700", fontSize: "17px" }}>
                        📊 {data.confidence != null ? `${data.confidence}%` : "N/A"}
                    </p>
                </div>
            </div>

            <div
                style={{
                    background: "rgba(255,255,255,.08)",
                    borderRadius: "12px",
                    padding: "16px 18px",
                    marginBottom: "18px"
                }}
            >
                <p style={{ margin: 0, opacity: 0.7, fontSize: "13px" }}>
                    Reason
                </p>
                <p style={{ margin: "6px 0 0" }}>
                    {data.reason}
                </p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                    gap: "16px"
                }}
            >
                <div
                    style={{
                        background: "rgba(34,197,94,.15)",
                        border: "1px solid rgba(34,197,94,.35)",
                        borderRadius: "12px",
                        padding: "16px 18px"
                    }}
                >
                    <h4 style={{ margin: "0 0 10px" }}>
                        ⛽ Fuel Saving Tips
                    </h4>

                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                        {data.fuel_tips.map((tip, i) => (
                            <li key={i} style={{ marginBottom: "6px" }}>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>

                <div
                    style={{
                        background: "rgba(239,68,68,.15)",
                        border: "1px solid rgba(239,68,68,.35)",
                        borderRadius: "12px",
                        padding: "16px 18px"
                    }}
                >
                    <h4 style={{ margin: "0 0 10px" }}>
                        🛡️ Safety Tips
                    </h4>

                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                        {data.safety_tips.map((tip, i) => (
                            <li key={i} style={{ marginBottom: "6px" }}>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

AIRecommendationCard.propTypes = {
    data: PropTypes.shape({
        traffic_status: PropTypes.string,
        congestion_level: PropTypes.string,
        recommended_route: PropTypes.string,
        reason: PropTypes.string,
        estimated_delay: PropTypes.number,
        suggested_departure: PropTypes.string,
        fuel_tips: PropTypes.arrayOf(PropTypes.string),
        safety_tips: PropTypes.arrayOf(PropTypes.string),
        confidence: PropTypes.number
    })
};

export default AIRecommendationCard;
