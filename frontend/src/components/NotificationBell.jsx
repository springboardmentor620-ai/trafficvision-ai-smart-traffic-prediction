import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getAlerts } from "../services/alertService";
import "../styles/NotificationBell.css";

function NotificationBell() {

  const [alerts, setAlerts] = useState([]);

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  const loadNotifications = async () => {

    try {

      const data = await getAlerts();

      setAlerts(data);

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    loadNotifications();

    const interval = setInterval(() => {

      loadNotifications();

    }, 60000);

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {

    const handleOutsideClick = (event) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {

        setOpen(false);

      }

    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, []);

  return (

    <div
      className="notification-wrapper"
      ref={dropdownRef}
    >

      <button
        className="notification-button"
        onClick={() => setOpen(!open)}
      >

        🔔

        {alerts.length > 0 && (

          <span className="notification-count">

            {alerts.length > 9
              ? "99+"
              : alerts.length}

          </span>

        )}

      </button>

      {open && (

        <div className="notification-dropdown">

          <div className="notification-top">

            <h3>
              Traffic Notifications
            </h3>

            <span>
              {alerts.length} Alerts
            </span>

          </div>

          {alerts.length === 0 ? (

            <div className="empty-notification">

              🚗 No new traffic alerts

            </div>

          ) : (

            <>

              {alerts.slice(0, 5).map((alert) => (

                <div
                  key={alert._id}
                  className={`notification-card ${alert.severity.toLowerCase()}`}
                >

                  <div className="notification-title">

                    <span>

                      {alert.severity === "Severe"
                        ? "🔴"
                        : alert.severity === "High"
                        ? "🟠"
                        : alert.severity === "Medium"
                        ? "🟡"
                        : "🟢"}

                    </span>

                    <strong>

                      {alert.area_name}

                    </strong>

                  </div>

                  <p>

                    {alert.road_name}

                  </p>

                  <small>

                    🚦 {alert.predicted_congestion}% Congestion

                  </small>

                  <br />

                  <small>

                    ⏱ {alert.delay}

                  </small>

                  <br />

                  <small>

                    🕒 {alert.alert_time}

                  </small>

                </div>

              ))}

              <Link
                to="/alerts"
                className="view-all-btn"
                onClick={() => setOpen(false)}
              >

                View All Alerts →

              </Link>

            </>

          )}

        </div>

      )}

    </div>

  );

}

export default NotificationBell;