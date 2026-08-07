// import Navbar from "../components/layout/Navbar";
// import Footer from "../components/layout/Footer";

// function AdminAlerts() {
//   return (
//     <>
//       <Navbar />

//       <div style={{ padding: "30px" }}>
//         <h1>Manage Alerts</h1>
//         <p>Edit, Resolve and Delete Alerts.</p>
//       </div>

//       <Footer />
//     </>
//   );
// }

// export default AdminAlerts;

// import { useEffect, useState } from "react";
// import Navbar from "../components/layout/Navbar";
// import Footer from "../components/layout/Footer";
// import { updateAlert } from "../services/alertService";
// import {
//   getAlerts,
//   resolveAlert,
//   deleteAlert,
// } from "../services/alertService";
// import "../styles/AdminAlerts.css";

// function AdminAlerts() {
//   const [alerts, setAlerts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingAlert, setEditingAlert] = useState(null);

// const [formData, setFormData] = useState({
//   severity: "",
//   delay: "",
//   weather: "",
//   recommendations: "",
// });

//   const loadAlerts = async () => {
//     try {
//       const data = await getAlerts();
//       setAlerts(data);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadAlerts();
//   }, []);

//   const handleResolve = async (id) => {
//     try {
//         await resolveAlert(id);
//         await loadAlerts();
//     } catch (error) {
//         console.log(error);
//         alert("Unable to resolve alert.");
//     }
// };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this alert?")) return;

//     try {
//       await deleteAlert(id);
//       loadAlerts();
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleEdit = (alert) => {

//   setEditingAlert(alert);

//   setFormData({

//     severity: alert.severity,

//     delay: alert.delay,

//     weather: alert.weather,

//     recommendations: alert.recommendations.join(", ")

//   });

// };
// const saveChanges = async () => {

//   try {

//     await updateAlert(editingAlert._id, {

//       severity: formData.severity,

//       delay: formData.delay,

//       weather: formData.weather,

//       recommendations: formData.recommendations
//         .split(",")
//         .map(item => item.trim())

//     });

//     setEditingAlert(null);

//     loadAlerts();

//   }

//   catch(err){

//     console.log(err);

//     alert("Unable to update alert.");

//   }

// };

//   return (
//     <>
//       <Navbar />

//       <div className="admin-alerts-page">

//         <h1>🚨 Alert Management</h1>

//         {loading ? (
//           <h2>Loading...</h2>
//         ) : (
//           alerts.map((alert) => (
//             <div
//               key={alert._id}
//               className="admin-alert-card"
//             >
//               <div className="card-top">

//                 <span
//                   className={`severity ${alert.severity.toLowerCase()}`}
//                 >
//                   {alert.severity}
//                 </span>

//                 <h2>
//                   {alert.source} → {alert.destination}
//                 </h2>

//                 <div className="percentage">
//                   {alert.predicted_congestion}%
//                 </div>

//               </div>

//               <div className="card-grid">

//                 <div>

//                   <strong>Delay</strong>

//                   <p>{alert.delay}</p>

//                 </div>

//                 <div>

//                   <strong>Weather</strong>

//                   <p>{alert.weather}</p>

//                 </div>

//                 <div>

//                   <strong>Status</strong>

//                   <p>{alert.status}</p>

//                 </div>

//                 <div>

//                   <strong>Created</strong>

//                   <p>{alert.alert_time}</p>

//                 </div>

//               </div>

//               <div className="button-row">

//                 <button
//                   className="edit-btn"
//                   onClick={() => handleEdit(alert)}
//                 >
//                   ✏ Edit
//                 </button>

//                 {alert.status === "Active" && (
//                   <button
//                     className="resolve-btn"
//                     onClick={() => handleResolve(alert._id)}
//                   >
//                     ✅ Resolve
//                   </button>
//                 )}

//                 <button
//                   className="delete-btn"
//                   onClick={() => handleDelete(alert._id)}
//                 >
//                   🗑 Delete
//                 </button>
//                 <button
//     className="resolve-btn"
//     onClick={() => handleResolve(alert._id)}
//     disabled={alert.status === "Resolved"}
// >
//     {alert.status === "Resolved"
//         ? "✅ Resolved"
//         : "✅ Resolve"}
// </button>
//               </div>

//             </div>
//           ))
//         )}

//       </div>
//         {
// editingAlert && (

// <div className="edit-overlay">

// <div className="edit-modal">

// <h2>✏ Edit Alert</h2>

// <label>Severity</label>

// <select
// value={formData.severity}
// onChange={(e)=>

// setFormData({

// ...formData,

// severity:e.target.value

// })

// }
// >

// <option>High</option>

// <option>Medium</option>

// <option>Low</option>

// <option>Normal</option>

// </select>

// <label>Delay</label>

// <input

// value={formData.delay}

// onChange={(e)=>

// setFormData({

// ...formData,

// delay:e.target.value

// })

// }

// />

// <label>Weather</label>

// <input

// value={formData.weather}

// onChange={(e)=>

// setFormData({

// ...formData,

// weather:e.target.value

// })

// }

// />

// <label>Recommendations</label>

// <textarea

// rows="4"

// value={formData.recommendations}

// onChange={(e)=>

// setFormData({

// ...formData,

// recommendations:e.target.value

// })

// }

// />

// <div className="popup-buttons">

// <button

// className="save-btn"

// onClick={saveChanges}

// >

// 💾 Save

// </button>

// <button

// className="cancel-btn"

// onClick={()=>setEditingAlert(null)}

// >

// Cancel

// </button>

// </div>

// </div>

// </div>

// )
// }
//       <Footer />
//     </>
//   );
// }

// export default AdminAlerts;

import { useEffect, useState } from "react";

import {
    getAlerts,
    resolveAlert,
    deleteAlert,
    updateAlert
} from "../services/alertService";

import "../styles/AdminAlerts.css";


function AdminAlerts() {

    const [alerts, setAlerts] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadAlerts();

    }, []);
    const loadAlerts = async () => {

        try {

            setLoading(true);

            const data = await getAlerts();

            setAlerts(data);

        } catch (error) {

            console.log(error);

            alert("Unable to load alerts.");

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadAlerts();

    }, []);


    const handleResolve = async (id) => {

        try {

            await resolveAlert(id);

            alert("Alert resolved successfully.");

            await loadAlerts();

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Unable to resolve alert."
            );

        }

    };


    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this alert?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await deleteAlert(id);

            alert("Alert deleted successfully.");

            await loadAlerts();

        } catch (error) {

            console.log(error);

            alert("Unable to delete alert.");

        }

    };


    return (

        <div className="admin-alerts-page">

            <div className="admin-alerts-header">

                <div>

                    <h1>🚨 Alert Management</h1>

                    <p>
                        Manage traffic alerts and update their status.
                    </p>

                </div>

                <button
                    onClick={loadAlerts}
                    className="refresh-btn"
                >
                    🔄 Refresh
                </button>

            </div>


            {loading ? (

                <div className="loading">
                    Loading alerts...
                </div>

            ) : alerts.length === 0 ? (

                <div className="empty-alerts">
                    <h2>🎉 No Alerts</h2>

                    <p>
                        There are currently no traffic alerts.
                    </p>
                </div>

            ) : (

                <div className="alerts-table-container">

                    <table className="admin-alerts-table">

                        <thead>

                            <tr>

                                <th>Source</th>

                                <th>Destination</th>

                                <th>Congestion</th>

                                <th>Severity</th>

                                <th>Status</th>

                                <th>Actions</th>

                            </tr>

                        </thead>


                        <tbody>

                            {alerts.map((alert) => (

                                <tr key={alert._id}>

                                    <td>
                                        {alert.source ||
                                            alert.from ||
                                            "N/A"}
                                    </td>

                                    <td>
                                        {alert.destination ||
                                            alert.to ||
                                            "N/A"}
                                    </td>

                                    <td>
                                        {alert.congestion != null
                                            ? `${alert.congestion}%`
                                            : "N/A"}
                                    </td>

                                    <td>

                                        <span
                                            className={
                                                `severity ${String(
                                                    alert.severity ||
                                                    "Medium"
                                                ).toLowerCase()}`
                                            }
                                        >
                                            {alert.severity || "Medium"}
                                        </span>

                                    </td>

                                    <td>

                                        <span
                                            className={
                                                alert.status === "Resolved"
                                                    ? "status resolved"
                                                    : "status active"
                                            }
                                        >

                                            {alert.status === "Resolved"
                                                ? "✅ Resolved"
                                                : "🚨 Active"}

                                        </span>

                                    </td>

                                    <td>

                                        <div className="alert-actions">

                                            <button
                                                className="resolve-btn"
                                                disabled={
                                                    alert.status ===
                                                    "Resolved"
                                                }
                                                onClick={() =>
                                                    handleResolve(
                                                        alert._id
                                                    )
                                                }
                                            >

                                                {alert.status ===
                                                "Resolved"
                                                    ? "✅ Resolved"
                                                    : "✅ Resolve"}

                                            </button>


                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    handleDelete(
                                                        alert._id
                                                    )
                                                }
                                            >

                                                🗑 Delete

                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}


export default AdminAlerts;