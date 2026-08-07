// import { useState } from "react";
// import "../styles/RouteRecommendation.css";
// import RouteMap from "./RouteMap";

// function RouteRecommendation({ areas = [] }) {
//   const [source, setSource] = useState("");
//   const [destination, setDestination] = useState("");

//   const [routeData, setRouteData] = useState(null);

//   const findRoute = () => {
//     if (!source || !destination) {
//       alert("Please select both source and destination.");
//       return;
//     }

//     if (source === destination) {
//       alert("Source and Destination cannot be the same.");
//       return;
//     }

//     // Clear previous result
//     setRouteData(null);
//   };

//   return (
//     <div className="route-card">

//       <h2>🛣️ Smart Route Recommendation</h2>

//       <p className="route-subtitle">
//         Select your source and destination to discover the fastest route and
//         AI-powered alternate route.
//       </p>

//       <div className="route-search">

//         <div className="input-group">
//           <label>📍 From</label>

//           <select
//             value={source}
//             onChange={(e) => setSource(e.target.value)}
//           >
//             <option value="">Select Starting Area</option>

//             {areas.map((area) => (
//               <option
//                 key={area}
//                 value={area}
//               >
//                 {area}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="input-group">
//           <label>🎯 To</label>

//           <select
//             value={destination}
//             onChange={(e) => setDestination(e.target.value)}
//           >
//             <option value="">Select Destination</option>

//             {areas.map((area) => (
//               <option
//                 key={area}
//                 value={area}
//               >
//                 {area}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button
//           className="route-btn"
//           onClick={findRoute}
//         >
//           🚗 Find Best Route
//         </button>

//       </div>

//       {routeData && (
//         <div className="route-result">

//           <div className="route-box">
//             <h3>✅ Recommended Route</h3>

//             <p>
//               <strong>Distance:</strong>{" "}
//               {routeData.recommended.distance.toFixed(2)} km
//             </p>

//             <p>
//               <strong>Time:</strong>{" "}
//               {routeData.recommended.duration} mins
//             </p>

//             <p>
//               <strong>Traffic:</strong>{" "}
//               {routeData.recommended.traffic}
//             </p>
//           </div>

//           {routeData.alternate && (
//             <div className="route-box">
//               <h3>🛣️ Alternate Route</h3>

//               <p>
//                 <strong>Distance:</strong>{" "}
//                 {routeData.alternate.distance.toFixed(2)} km
//               </p>

//               <p>
//                 <strong>Time:</strong>{" "}
//                 {routeData.alternate.duration} mins
//               </p>

//               <p>
//                 <strong>Traffic:</strong>{" "}
//                 {routeData.alternate.traffic}
//               </p>
//             </div>
//           )}

//           <div className="route-box">
//             <h3>🏆 Best Route</h3>

//             <h2 style={{ color: "green" }}>
//               {routeData.comparison.best_route}
//             </h2>

//             <p>
//               ✔ Saves{" "}
//               {routeData.comparison.time_saved} mins
//             </p>

//             <p>
//               ✔ Saves{" "}
//               {routeData.comparison.distance_saved.toFixed(2)} km
//             </p>

//             <p>
//               ✔ Less Traffic
//             </p>
//           </div>

//         </div>
//       )}

//       <RouteMap
//         source={source}
//         destination={destination}
//         onRouteData={(data) => setRouteData(data)}
//       />

//     </div>
//   );
// }

// export default RouteRecommendation;

// import { useEffect, useState } from "react";
// import RouteMap from "./RouteMap";
// import { getRoute } from "../services/routeService";

// function RouteRecommendation() {

//   const [routeData, setRouteData] = useState(null);

//   useEffect(() => {

//     const prediction = JSON.parse(
//       localStorage.getItem("latestPrediction")
//     );

//     if (!prediction) return;

//     loadRoute(
//       prediction.source,
//       prediction.destination
//     );

//   }, []);

//   const loadRoute = async (source, destination) => {

//     try {

//       const data = await getRoute(
//         source,
//         destination
//       );

//       setRouteData(data);

//     } catch (err) {

//       console.log(err);

//     }

//   };

//   if (!routeData)
//     return <h2>Loading Route...</h2>;

//   return (

//     <>

//       <RouteMap
//         geometry={routeData.recommended.geometry}
//       />

//       <div className="route-grid">

//         <div className="route-card">

//           <h2>
//             ✅ Recommended Route
//           </h2>

//           <p>
//             Distance :
//             {routeData.recommended.distance} km
//           </p>

//           <p>
//             Time :
//             {routeData.recommended.duration} mins
//           </p>

//           <p>
//             Traffic :
//             {routeData.recommended.traffic}
//           </p>

//           <p>
//             Fuel :
//             {routeData.recommended.fuel} L
//           </p>

//         </div>

//         {routeData.alternate && (

//           <div className="route-card">

//             <h2>
//               🔄 Alternate Route
//             </h2>

//             <p>
//               Distance :
//               {routeData.alternate.distance} km
//             </p>

//             <p>
//               Time :
//               {routeData.alternate.duration} mins
//             </p>

//             <p>
//               Traffic :
//               {routeData.alternate.traffic}
//             </p>

//             <p>
//               Fuel :
//               {routeData.alternate.fuel} L
//             </p>

//           </div>

//         )}

//       </div>

//     </>

//   );

// }

// export default RouteRecommendation;

// import RouteMap from "./RouteMap";

// function RouteRecommendation({ prediction }) {

//     if (!prediction) {

//         return null;

//     }

//     return (

//         <div>

//             <div
//                 style={{
//                     display: "grid",
//                     gridTemplateColumns: "1fr 1fr",
//                     gap: "20px",
//                     marginBottom: "30px"
//                 }}
//             >

//                 <div className="route-box">

//                     <h2>🟢 Recommended Route</h2>

//                     <p>

//                         <strong>Source :</strong>

//                         {" "}

//                         {prediction.source}

//                     </p>

//                     <p>

//                         <strong>Destination :</strong>

//                         {" "}

//                         {prediction.destination}

//                     </p>

//                     <p>

//                         <strong>Distance :</strong>

//                         {" "}

//                         {prediction.route.distance} km

//                     </p>

//                     <p>

//                         <strong>Time :</strong>

//                         {" "}

//                         {prediction.route.duration} mins

//                     </p>

//                     <p>

//                         <strong>Traffic :</strong>

//                         {" "}

//                         {prediction.route.traffic}

//                     </p>

//                     <p>

//                         <strong>Congestion :</strong>

//                         {" "}

//                         {prediction.predicted_congestion}%

//                     </p>

//                     <p>

//                         <strong>Fuel :</strong>

//                         {" "}

//                         {prediction.route.fuel} L

//                     </p>

//                 </div>

//                 {

//                     prediction.alternate_route && (

//                         <div className="route-box">

//                             <h2>🔴 Alternate Route</h2>

//                             <p>

//                                 <strong>Distance :</strong>

//                                 {" "}

//                                 {prediction.alternate_route.distance} km

//                             </p>

//                             <p>

//                                 <strong>Time :</strong>

//                                 {" "}

//                                 {prediction.alternate_route.duration} mins

//                             </p>

//                             <p>

//                                 <strong>Traffic :</strong>

//                                 {" "}

//                                 {prediction.alternate_route.traffic}

//                             </p>

//                             <p>

//                                 <strong>Congestion :</strong>

//                                 {" "}

//                                 {prediction.alternate_route.predicted_congestion}%

//                             </p>

//                             <p>

//                                 <strong>Fuel :</strong>

//                                 {" "}

//                                 {prediction.alternate_route.fuel} L

//                             </p>

//                         </div>

//                     )

//                 }

//             </div>

//             <RouteMap

//                 recommendedRoute={prediction.route}

//                 alternateRoute={prediction.alternate_route}

//             />

//         </div>

//     );

// }

// export default RouteRecommendation;

// import RouteMap from "./RouteMap";

// function RouteRecommendation({ prediction }) {

//     if (!prediction) {
//         return null;
//     }

//     return (

//         <div>

//             {/* Journey Information */}

//             <div className="journey-card">

//                 <h2>📍 Journey Information</h2>

//                 <div
//                     style={{
//                         display: "grid",
//                         gridTemplateColumns: "1fr 1fr",
//                         gap: "20px",
//                         marginBottom: "35px",
//                     }}
//                 >

//                     <div className="route-box">

//                         <h3>📍 Source</h3>

//                         <h2>{prediction.source}</h2>

//                     </div>

//                     <div className="route-box">

//                         <h3>🎯 Destination</h3>

//                         <h2>{prediction.destination}</h2>

//                     </div>

//                 </div>

//             </div>


//             {/* Route Cards */}

            
//                 <h4 style={{ marginTop: "20px" }}>
//                     🛣 Route Timeline
//                 </h4>

// <div
//     style={{
//         marginTop: "20px",
//         marginBottom: "25px",
//     }}
// >

//     <div
//         style={{
//             fontWeight: "bold",
//             color: "#16a34a",
//             marginBottom: "10px",
//             fontSize: "18px",
//         }}
//     >
//         📍 {prediction.source}
//     </div>

//     {prediction.route.timeline &&
//         prediction.route.timeline.map((road, index) => (

//             <div
//                 key={index}
//                 style={{
//                     marginLeft: "15px",
//                     marginBottom: "12px",
//                     color: "#444",
//                 }}
//             >

//                 │

//                 <br />

//                 🚦 {road}

//             </div>

//         ))}

//     <div
//         style={{
//             marginTop: "10px",
//             fontWeight: "bold",
//             color: "#2563eb",
//             fontSize: "18px",
//         }}
//     >
//         🎯 {prediction.destination}
//     </div>

// </div>

// <hr />

// <h4>📊 Route Details</h4>

// <p>
//     <strong>📏 Distance :</strong>{" "}
//     {prediction.route.distance} km
// </p>

// <p>
//     <strong>⏱ Time :</strong>{" "}
//     {prediction.route.duration} mins
// </p>

// <p>
//     <strong>🚗 Traffic :</strong>{" "}
//     {prediction.route.traffic}
// </p>

// <p>
//     <strong>🚦 Congestion :</strong>{" "}
//     {prediction.predicted_congestion.toFixed(1)}%
// </p>

// <p>
//     <strong>⛽ Fuel :</strong>{" "}
//     {prediction.route.fuel} L
// </p>

//                 </div>
                

//                 {/* Alternate Route */}

//                 {prediction.alternate_route && (

//                     <div className="route-box">

//                         <h2>🔴 Alternate Route</h2>

//                         <hr />

//                         <h4>📊 Route Details</h4>

//                         <p>
//                             <strong>📏 Distance :</strong>{" "}
//                             {prediction.alternate_route.distance} km
//                         </p>

//                         <p>
//                             <strong>⏱ Time :</strong>{" "}
//                             {prediction.alternate_route.duration} mins
//                         </p>

//                         <p>
//                             <strong>🚗 Traffic :</strong>{" "}
//                             {prediction.alternate_route.traffic}
//                         </p>

//                         <p>
//                             <strong>🚦 Congestion :</strong>{" "}
//                             {prediction.alternate_route.predicted_congestion.toFixed(1)}%
//                         </p>

//                         <p>
//                             <strong>⛽ Fuel :</strong>{" "}
//                             {prediction.alternate_route.fuel} L
//                         </p>

//                     </div>

//                 )}

//             </div>


//             {/* Map */}

//             <h2
//                 style={{
//                     marginBottom: "15px",
//                     color: "#1e3a8a",
//                 }}
//             >
//                 🗺 Live Route Map
//             </h2>

//             <RouteMap
//                 recommendedRoute={prediction.route}
//                 alternateRoute={prediction.alternate_route}
//             />

//         </div>

//     );

// }

// export default RouteRecommendation;

import RouteMap from "./RouteMap";

function RouteRecommendation({ prediction }) {

    if (!prediction) {
        return null;
    }

    return (

        <div>

            {/* Journey Information */}

            <div
                style={{
                    marginBottom: "35px",
                }}
            >

                <h2
                    style={{
                        marginBottom: "20px",
                        color: "#1e3a8a",
                    }}
                >
                    📍 Journey Information
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                    }}
                >

                    <div className="route-box">

                        <h3>📍 Source</h3>

                        <h2>{prediction.source}</h2>

                    </div>

                    <div className="route-box">

                        <h3>🎯 Destination</h3>

                        <h2>{prediction.destination}</h2>

                    </div>

                </div>

            </div>

            {/* Route Cards */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginBottom: "35px",
                }}
            >

                {/* Recommended Route */}

                <div className="route-box">

                    <h2>🟢 Recommended Route</h2>

                    <hr />

                    <h3>🛣 Route Timeline</h3>

                    <div style={{ marginTop: "20px", marginBottom: "25px" }}>

                        <div
                            style={{
                                fontWeight: "bold",
                                color: "#16a34a",
                                fontSize: "18px",
                            }}
                        >
                            📍 {prediction.source}
                        </div>

                        {prediction.route.timeline &&
                            prediction.route.timeline.map((road, index) => (

                                <div
                                    key={index}
                                    style={{
                                        marginLeft: "18px",
                                        marginTop: "10px",
                                        marginBottom: "10px",
                                    }}
                                >
                                    │
                                    <br />
                                    🚦 {road}
                                </div>

                            ))}

                        <div
                            style={{
                                fontWeight: "bold",
                                color: "#2563eb",
                                fontSize: "18px",
                            }}
                        >
                            🎯 {prediction.destination}
                        </div>

                    </div>

                    <hr />

                    <h3>📊 Route Details</h3>

                    <p>
                        <strong>📏 Distance :</strong>{" "}
                        {prediction.route.distance} km
                    </p>

                    <p>
                        <strong>⏱ Time :</strong>{" "}
                        {prediction.route.duration} mins
                    </p>

                    <p>
                        <strong>🚗 Traffic :</strong>{" "}
                        {prediction.route.traffic}
                    </p>

                    <p>
                        <strong>🚦 Congestion :</strong>{" "}
                        {prediction.predicted_congestion.toFixed(1)}%
                    </p>

                    <p>
                        <strong>⛽ Fuel :</strong>{" "}
                        {prediction.route.fuel} L
                    </p>

                </div>

                {/* Alternate Route */}

                {prediction.alternate_route && (

                    <div className="route-box">

                        <h2>🔴 Alternate Route</h2>

                        <hr />

                        <h3>🛣 Route Timeline</h3>

                        <div style={{ marginTop: "20px", marginBottom: "25px" }}>

                            <div
                                style={{
                                    fontWeight: "bold",
                                    color: "#dc2626",
                                    fontSize: "18px",
                                }}
                            >
                                📍 {prediction.source}
                            </div>

                            {prediction.alternate_route.timeline &&
                                prediction.alternate_route.timeline.map((road, index) => (

                                    <div
                                        key={index}
                                        style={{
                                            marginLeft: "18px",
                                            marginTop: "10px",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        │
                                        <br />
                                        🚦 {road}
                                    </div>

                                ))}

                            <div
                                style={{
                                    fontWeight: "bold",
                                    color: "#2563eb",
                                    fontSize: "18px",
                                }}
                            >
                                🎯 {prediction.destination}
                            </div>

                        </div>

                        <hr />

                        <h3>📊 Route Details</h3>

                        <p>
                            <strong>📏 Distance :</strong>{" "}
                            {prediction.alternate_route.distance} km
                        </p>

                        <p>
                            <strong>⏱ Time :</strong>{" "}
                            {prediction.alternate_route.duration} mins
                        </p>

                        <p>
                            <strong>🚗 Traffic :</strong>{" "}
                            {prediction.alternate_route.traffic}
                        </p>

                        <p>
                            <strong>🚦 Congestion :</strong>{" "}
                            {prediction.alternate_route.predicted_congestion.toFixed(1)}%
                        </p>

                        <p>
                            <strong>⛽ Fuel :</strong>{" "}
                            {prediction.alternate_route.fuel} L
                        </p>

                    </div>

                )}

            </div>

            {/* Map */}

            <h2
                style={{
                    color: "#1e3a8a",
                    marginBottom: "20px",
                }}
            >
                🗺 Live Route Map
            </h2>

            <RouteMap
                recommendedRoute={prediction.route}
                alternateRoute={prediction.alternate_route}
            />

        </div>

    );

}

export default RouteRecommendation;