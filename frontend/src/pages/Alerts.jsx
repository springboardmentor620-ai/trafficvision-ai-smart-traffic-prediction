// import { useEffect, useState } from "react";
// import Navbar from "../components/layout/Navbar";
// import Footer from "../components/layout/Footer";
// import { getAlerts } from "../services/alertService";
// import "../styles/Alerts.css";

// function Alerts() {

//   const [alerts, setAlerts] = useState([]);

//   const [loading, setLoading] = useState(true);

//   const loadAlerts = async () => {

//     try {

//       const data = await getAlerts();

//       setAlerts(data);

//     } catch (error) {

//       console.log(error);

//     } finally {

//       setLoading(false);

//     }

//   };

//   useEffect(() => {

//     loadAlerts();

//     const interval = setInterval(loadAlerts, 60000);

//     return () => clearInterval(interval);

//   }, []);

//   return (

//     <>

//       <Navbar />

//       <div className="alerts-page">

//         <div className="alerts-toolbar">

//     <h1>🚨 Live Traffic Alerts</h1>

//     <div className="toolbar-actions">

//         <input
//             type="text"
//             placeholder="🔍 Search Source or Destination..."
//         />

//         <select>

//             <option>All</option>

//             <option>High</option>

//             <option>Medium</option>

//             <option>Low</option>

//             <option>Resolved</option>

//         </select>

//         <button
//             onClick={loadAlerts}
//         >
//             🔄 Refresh
//         </button>

//     </div>

// </div>

//         {loading ? (

//           <h3>Loading alerts...</h3>

//         ) : alerts.length === 0 ? (

//           <div className="empty-alerts">

//             ✅ No traffic alerts found.

//           </div>

//         ) : (

//           alerts.map((alert) => (

//             <div
//               key={alert._id}
//               className="alert-card"
//             >

//               <div className="alert-top">

//                 <div>

//                 <span
//                   className={`status-badge badge-${alert.severity.toLowerCase()}`}
//                 >
//                   {alert.severity}
//                 </span>

//                   <h2>

//                     {alert.area_name}

//                   </h2>

//                   <p>

//                     {alert.road_name}

//                   </p>

//                 </div>

//                 <div
//                   className={`percentage percentage-${alert.severity.toLowerCase()}`}
//                 >
//                   {alert.predicted_congestion}%
//                 </div>

//               </div>

//               <div className="alert-details">

//                 <div>

//                   <strong>Estimated Delay</strong>

//                   <p>{alert.delay}</p>

//                 </div>

//                 <div>

//                   <strong>Traffic Volume</strong>

//                   <p>{alert.traffic_volume}</p>

//                 </div>

//                 <div>

//                   <strong>Average Speed</strong>

//                   <p>{alert.average_speed} km/h</p>

//                 </div>

//                 <div>

//                   <strong>Road Capacity</strong>

//                   <p>{alert.road_capacity}%</p>

//                 </div>

//                 <div>

//                   <strong>Weather</strong>

//                   <p>{alert.weather}</p>

//                 </div>

//                 <div>

//                   <strong>Incidents</strong>

//                   <p>{alert.incident_reports}</p>

//                 </div>

//               </div>

//               <div className="section">

//                 <h3>Alerts</h3>

//                 <ul>

//                   {alert.alerts.map((item, index) => (

//                     <li key={index}>

//                       {item}

//                     </li>

//                   ))}

//                 </ul>

//               </div>

//               <div className="section">

//                 <h3>Recommended Action</h3>

//                 <ul>

//                   {alert.recommendations.map((item, index) => (

//                     <li key={index}>

//                       {item}

//                     </li>

//                   ))}

//                 </ul>

//               </div>

//               <div className="alert-time">

//                 🕒 {alert.alert_time}

//               </div>

//             </div>

//           ))

//         )}

//       </div>

//       <Footer />

//     </>

//   );

// }

// export default Alerts;

import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import {

    getAlerts,

    deleteAlert,

    updateAlert,

    resolveAlert

} from "../services/alertService";
import "../styles/Alerts.css";

function Alerts() {

  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [editingAlert, setEditingAlert] = useState(null);
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  const loadAlerts = async () => {

    try {

      const data = await getAlerts();

      setAlerts(data);

      setFilteredAlerts(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadAlerts();

    const interval = setInterval(loadAlerts, 60000);

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {

    let data = [...alerts];

    if (filter !== "All") {

      data = data.filter(
        (a) => a.status === filter
      );

    }

    if (search !== "") {

      data = data.filter((a) =>

        `${a.source} ${a.destination}`

          .toLowerCase()

          .includes(search.toLowerCase())

      );

    }

    setFilteredAlerts(data);

  }, [search, filter, alerts]);
  const handleResolve = async (id) => {

    try{

        await resolveAlert(id);

        loadAlerts();

    }

    catch(error){

        console.log(error);

        window.alert("Unable to resolve alert.");

    }

};
const handleDelete = async (id) => {

    if(

        !window.confirm(

            "Delete this alert?"

        )

    ) return;

    try{

        await deleteAlert(id);

        loadAlerts();

    }

    catch(error){

        console.log(error);

        alert("Unable to delete alert.");

    }

};

  const resolveAlert = async (id) => {

    try {

        await resolveAlertService(id);

        loadAlerts();

    } catch (err) {

        console.log(err);

        window.alert("Unable to resolve alert.");

    }

};

  const removeAlert = async (id) => {

    if (!window.confirm("Delete this alert?"))

      return;

    try {

      await deleteAlert(id);

      loadAlerts();

    } catch (err) {

      console.log(err);

    }

  };

  const editAlert = (selectedAlert) => {

    console.log(selectedAlert);

    window.alert("Edit popup will be added later.");

};

  return (

    <>

      <Navbar />

      <div className="alerts-page">

        <div className="alerts-toolbar">

          <h1>🚨 Live Traffic Alerts</h1>

          <div className="toolbar-actions">

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
            >

              <option>All</option>

              <option>Active</option>

              <option>Resolve</option>

            </select>

            <button onClick={loadAlerts}>

              🔄 Refresh

            </button>

          </div>

        </div>

        {loading ? (

          <h2>Loading...</h2>

        ) : (

          filteredAlerts.map((alert) => (

            <div
              key={alert._id}
              className="alert-card"
            >

              <div className="alert-top">

                <span
                  className={`status-badge badge-${alert.severity.toLowerCase()}`}
                >

                  {alert.severity}

                </span>

                <div
                  className={`percentage percentage-${alert.severity.toLowerCase()}`}
                >

                  {alert.predicted_congestion}%

                </div>

              </div>

              <h2>

                {alert.source}

                {" → "}

                {alert.destination}

              </h2>

              <div className="alert-grid">

                <div>

                  <strong>Congestion</strong>

                  <p>{alert.predicted_congestion}%</p>

                </div>

                <div>

                  <strong>Delay</strong>

                  <p>{alert.delay}</p>

                </div>

                <div>

                  <strong>Weather</strong>

                  <p>{alert.weather}</p>

                </div>

                <div>

                  <strong>Status</strong>

                  <p>{alert.status}</p>

                </div>

              </div>

              <div className="section">

                <h3>Recommendations</h3>

                <ul>

                  {alert.recommendations?.map((r, i) => (

                    <li key={i}>{r}</li>

                  ))}

                </ul>

              </div>

              <div className="alert-footer">

                <span>

                  🕒 {alert.alert_time}

                </span>

                <div className="action-buttons">

                  <button
                    className="edit-btn"
                    onClick={() =>
                      editAlert(alert)
                    }
                  >

                    ✏ Edit

                  </button>

                  <button
                    className="resolve-btn"
                    onClick={() =>
                      handleResolve(alert._id)
                    }
                  >

                    ✅ Resolve

                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      removeAlert(alert._id)
                    }
                  >

                    🗑 Delete

                  </button>

                </div>

              </div>

            </div>

          ))

        )}

      </div>

      <Footer />

    </>

  );

}

export default Alerts;