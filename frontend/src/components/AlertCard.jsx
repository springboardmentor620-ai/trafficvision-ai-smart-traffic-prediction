import {
  MdBlock,
  MdDirectionsCar,
  MdEmergency,
  MdLocalHospital,
  MdSpeed,
  MdWarningAmber,
  MdWbSunny,
} from "react-icons/md";

const alertIcons = {
  "Heavy Traffic": MdDirectionsCar,
  Congestion: MdSpeed,
  Accident: MdLocalHospital,
  "Weather Alert": MdWbSunny,
  "Rush Hour": MdWarningAmber,
  "High Emission": MdWarningAmber,
  "Road Block": MdBlock,
  "Emergency Vehicle": MdEmergency,
};

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function AlertCard({ alert }) {
  const Icon = alertIcons[alert.alert_type] ?? MdWarningAmber;
  const severity = alert.severity.toLowerCase();

  return (
    <article className={`alert-card alert-card--${severity}`}>
      <div className="alert-card__icon" aria-hidden="true">
        <Icon />
      </div>

      <div className="alert-card__content">
        <div className="alert-card__heading">
          <div>
            <p className="alert-card__eyebrow">Traffic alert</p>
            <h2>{alert.alert_type}</h2>
          </div>
          <span className={`alert-card__severity alert-card__severity--${severity}`}>
            {alert.severity}
          </span>
        </div>

        <p className="alert-card__reason">{alert.reason}</p>
        <p className="alert-card__recommendation">
          <strong>Recommendation:</strong> {alert.recommendation}
        </p>

        <footer className="alert-card__footer">
          <span className="alert-card__status">
            <i /> {alert.status}
          </span>
          <time dateTime={alert.timestamp}>{formatTimestamp(alert.timestamp)}</time>
        </footer>
      </div>
    </article>
  );
}

export default AlertCard;

