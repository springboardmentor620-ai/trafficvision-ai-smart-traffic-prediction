import { useEffect, useMemo, useState } from "react";

import AdminLayout from "../../components/dashboard/AdminLayout";
import AlertCard from "../../components/alerts/AlertCard";

import {
  getAlerts,
  resolveAlert,
} from "../../services/alerts";

function Alerts() {

  const [alerts, setAlerts] = useState([]);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  const loadAlerts = async () => {

    try {

      const data = await getAlerts();

      setAlerts(data);

    }

    catch (err) {

      console.error(err);

    }

  };

  useEffect(() => {

    let mounted = true;

    const fetchAlerts = async () => {

      try {

        const data = await getAlerts();

        if (!mounted) return;

        setAlerts(data);

      }

      catch (err) {

        console.error(err);

      }

    };

    fetchAlerts();

    const timer = setInterval(fetchAlerts, 5000);

    return () => {

      mounted = false;

      clearInterval(timer);

    };

  }, []);

  const handleResolve = async (id) => {

    try {

      await resolveAlert(id);

      loadAlerts();

    }

    catch (err) {

      console.error(err);

    }

  };

  const filteredAlerts = useMemo(() => {

    return alerts.filter((alert) => {

      const matchesSearch =

        alert.title
          .toLowerCase()
          .includes(search.toLowerCase())

        ||

        alert.message
          .toLowerCase()
          .includes(search.toLowerCase())

        ||

        alert.road
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =

        filter === "All"

        ||

        alert.severity === filter;

      return matchesSearch && matchesFilter;

    });

  }, [alerts, search, filter]);

  return (

    <AdminLayout
      title="Traffic Alerts"
      subtitle="Live traffic alerts and notifications"
    >

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >

        <div className="stat-card">

          <h2>{alerts.length}</h2>

          <p>Total Alerts</p>

        </div>

        <div className="stat-card">

          <h2>
            {
              alerts.filter(
                (a) => a.severity === "Critical"
              ).length
            }
          </h2>

          <p>Critical</p>

        </div>

        <div className="stat-card">

          <h2>
            {
              alerts.filter(
                (a) => a.status === "Active"
              ).length
            }
          </h2>

          <p>Active</p>

        </div>

      </div>

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "25px",
        }}
      >

        <input

          type="text"

          placeholder="Search alerts..."

          value={search}

          onChange={(e) => setSearch(e.target.value)}

          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}

        />

        <select

          value={filter}

          onChange={(e) => setFilter(e.target.value)}

          style={{
            padding: "10px",
            borderRadius: "8px",
          }}

        >

          <option>All</option>

          <option>Critical</option>

          <option>High</option>

          <option>Medium</option>

          <option>Low</option>

        </select>

      </div>

      {

        filteredAlerts.map((alert) => (

          <AlertCard

            key={alert.id}

            alert={alert}

            onResolve={handleResolve}

          />

        ))

      }

    </AdminLayout>

  );

}

export default Alerts;