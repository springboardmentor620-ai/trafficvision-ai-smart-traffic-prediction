import { useEffect, useState } from "react";

import AlertCard from "../components/AlertCard";
import { getAlerts } from "../services/trafficService";
import "../styles/Alerts.css";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAlerts() {
      try {
        setIsLoading(true);
        setError("");
        const data = await getAlerts();
        if (isMounted) setAlerts(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (isMounted) setError("Traffic alerts are temporarily unavailable.");
        console.error("Unable to load traffic alerts:", requestError);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAlerts();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="alerts-page" aria-labelledby="alerts-title">
      <header className="alerts-page__header">
        <div>
          <p className="alerts-page__eyebrow">Live operations</p>
          <h1 id="alerts-title">Traffic Alerts</h1>
          <p>Actionable signals generated from the latest processed traffic data.</p>
        </div>
        <div className="alerts-page__summary" aria-label={`${alerts.length} active alerts`}>
          <span>{alerts.length}</span>
          Active alerts
        </div>
      </header>

      {isLoading && <div className="alerts-page__state">Loading traffic alerts…</div>}
      {!isLoading && error && <div className="alerts-page__state alerts-page__state--error">{error}</div>}
      {!isLoading && !error && alerts.length === 0 && (
        <div className="alerts-page__state">No active alerts were generated from the current dataset.</div>
      )}

      {!isLoading && !error && alerts.length > 0 && (
        <div className="alerts-grid">
          {alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)}
        </div>
      )}
    </section>
  );
}

export default Alerts;

