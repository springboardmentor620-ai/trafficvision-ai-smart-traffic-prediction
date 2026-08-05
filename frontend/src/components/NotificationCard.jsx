import PropTypes from "prop-types";

/**
 * Maps the alert the backend already generated (category/severity/message)
 * into a display spec - icon, title, color, subtitle. No new rules are
 * invented here beyond presentation; the underlying classification always
 * comes from the backend's TrafficAlert.
 */
export function getNotificationVisual(alert, route) {

    if (!alert) {
        return {
            icon: "✅",
            title: "Traffic Clear",
            color: "#16a34a",
            bg: "#dcfce7",
            subtitle: "No congestion detected."
        };
    }

    const { category, severity, message } = alert;
    const text = (message || "").toLowerCase();

    // Critical is an escalation applied on top of any category (see
    // traffic_alert_service.CRITICAL_RISK_THRESHOLD), so it takes visual
    // priority regardless of which category produced the alert.
    if (severity === "Critical") {
        return {
            icon: "🚨",
            title: "High Accident Risk",
            color: "#991b1b",
            bg: "#fecaca",
            subtitle: message || "Multiple risk factors detected - drive with extreme caution."
        };
    }

    if (category === "Weather") {

        if (text.includes("snow")) {
            return {
                icon: "❄️",
                title: "Snow Warning",
                color: "#0ea5e9",
                bg: "#e0f2fe",
                subtitle: "Road may be slippery."
            };
        }

        if (severity === "High") {
            const cause = text.includes("rain") ? "Heavy rain" : "Severe weather";
            return {
                icon: "🚧",
                title: "Accident Risk Alert",
                color: "#dc2626",
                bg: "#fee2e2",
                subtitle: `${cause} + high congestion detected. Drive carefully.`
            };
        }

        if (text.includes("fog") || text.includes("visibility")) {
            return {
                icon: "🌫️",
                title: "Weather Alert",
                color: "#64748b",
                bg: "#f1f5f9",
                subtitle: message
            };
        }

        return {
            icon: "🌧️",
            title: "Weather Alert",
            color: "#2563eb",
            bg: "#dbeafe",
            subtitle: message
        };
    }

    if (category === "Accident") {
        return {
            icon: "🚧",
            title: "Accident Risk Alert",
            color: "#dc2626",
            bg: "#fee2e2",
            subtitle: message
        };
    }

    if (category === "Road Work") {
        return {
            icon: "🚜",
            title: "Road Work Alert",
            color: "#f59e0b",
            bg: "#fef3c7",
            subtitle: message
        };
    }

    if (category === "Event") {
        return {
            icon: "🎉",
            title: "Event Traffic Alert",
            color: "#7c3aed",
            bg: "#ede9fe",
            subtitle: message
        };
    }

    // Congestion (default category)
    if (severity === "High") {
        return {
            icon: "⚠️",
            title: "Heavy Traffic Alert",
            color: "#dc2626",
            bg: "#fee2e2",
            subtitle: `High congestion detected. Use ${route || "the recommended route"}.`
        };
    }

    if (severity === "Medium") {
        return {
            icon: "🚦",
            title: "Moderate Traffic",
            color: "#f59e0b",
            bg: "#fef3c7",
            subtitle: message
        };
    }

    return {
        icon: "✅",
        title: "Traffic Clear",
        color: "#16a34a",
        bg: "#dcfce7",
        subtitle: "No congestion detected."
    };
}

function NotificationCard({ alert, route }) {

    const visual = getNotificationVisual(alert, route);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                background: visual.bg,
                borderLeft: `6px solid ${visual.color}`,
                borderRadius: "14px",
                padding: "20px",
                boxShadow: "0 8px 20px rgba(0,0,0,.06)"
            }}
        >
            <div style={{ fontSize: "32px", lineHeight: 1 }}>
                {visual.icon}
            </div>

            <div>
                <h3
                    style={{
                        margin: 0,
                        color: visual.color,
                        fontSize: "18px"
                    }}
                >
                    {visual.title}
                </h3>

                <p
                    style={{
                        margin: "6px 0 0",
                        color: "#333",
                        fontSize: "15px"
                    }}
                >
                    {visual.subtitle}
                </p>
            </div>
        </div>
    );
}

NotificationCard.propTypes = {
    alert: PropTypes.shape({
        category: PropTypes.string,
        severity: PropTypes.string,
        message: PropTypes.string
    }),
    route: PropTypes.string
};

export default NotificationCard;
