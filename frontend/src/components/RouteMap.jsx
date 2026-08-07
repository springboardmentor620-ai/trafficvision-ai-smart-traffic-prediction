// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Polyline,
// } from "react-leaflet";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { areaCoordinates } from "../data/areaCoordinates";

// // ----------------------------
// // Fix Leaflet Marker Icons
// // ----------------------------
// delete L.Icon.Default.prototype._getIconUrl;

// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

//   iconUrl:
//     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

//   shadowUrl:
//     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// function RouteMap({
//   source,
//   destination,
//   onRouteData,
// }) {
//   const [recommendedRoute, setRecommendedRoute] = useState([]);
//   const [alternateRoute, setAlternateRoute] = useState([]);

//   const [recommended, setRecommended] = useState(null);
//   const [alternate, setAlternate] = useState(null);

//   useEffect(() => {
//     const loadRoute = async () => {
//       if (!source || !destination) return;

//       const from = areaCoordinates[source];
//       const to = areaCoordinates[destination];

//       if (!from || !to) return;

//       try {
//         const response = await axios.post(
//           "http://127.0.0.1:8000/route",
//           {
//             coordinates: [
//               [from.lng, from.lat],
//               [to.lng, to.lat],
//             ],
//           }
//         );

//         const data = response.data;

//         if (!data.success) {
//           alert("Unable to fetch routes.");
//           return;
//         }

//         // -------------------------
//         // Recommended Route
//         // -------------------------

//         const recommendedCoordinates =
//           data.recommended.geometry.map((point) => [
//             point[1],
//             point[0],
//           ]);

//         setRecommendedRoute(
//           recommendedCoordinates
//         );

//         setRecommended(
//           data.recommended
//         );

//         // -------------------------
//         // Alternate Route
//         // -------------------------

//         if (data.alternate) {

//           const alternateCoordinates =
//             data.alternate.geometry.map((point) => [
//               point[1],
//               point[0],
//             ]);

//           setAlternateRoute(
//             alternateCoordinates
//           );

//           setAlternate(
//             data.alternate
//           );

//         } else {

//           setAlternateRoute([]);
//           setAlternate(null);

//         }

//         // -------------------------
//         // Send data to parent
//         // -------------------------

//         if (onRouteData) {

//           onRouteData({

//             recommended: data.recommended,

//             alternate: data.alternate,

//             comparison: data.comparison,

//           });

//         }

//       } catch (error) {

//         console.log(error);

//         alert("Unable to fetch route.");

//       }
//     };

//     loadRoute();

//   }, [source, destination]);

//   const center = [12.9716, 77.5946];

//   return (
//     <div style={{ marginTop: "30px" }}>

//       <MapContainer
//         center={center}
//         zoom={11}
//         style={{
//           height: "500px",
//           width: "100%",
//           borderRadius: "20px",
//         }}
//       >

//         <TileLayer
//           attribution="© OpenStreetMap contributors"
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         {/* Source Marker */}

//         {source && areaCoordinates[source] && (

//           <Marker
//             position={[
//               areaCoordinates[source].lat,
//               areaCoordinates[source].lng,
//             ]}
//           />

//         )}

//         {/* Destination Marker */}

//         {destination && areaCoordinates[destination] && (

//           <Marker
//             position={[
//               areaCoordinates[destination].lat,
//               areaCoordinates[destination].lng,
//             ]}
//           />

//         )}

//         {/* Recommended Route */}

//         {recommendedRoute.length > 0 && (

//           <Polyline
//             positions={recommendedRoute}
//             color="blue"
//             weight={6}
//           />

//         )}

//         {/* Alternate Route */}

//         {alternateRoute.length > 0 && (

//           <Polyline
//             positions={alternateRoute}
//             color="red"
//             weight={5}
//             dashArray="10"
//           />

//         )}
//               </MapContainer>

//       {(recommended || alternate) && (
//         <div
//           style={{
//             marginTop: "20px",
//             padding: "20px",
//             background: "#fff",
//             borderRadius: "15px",
//             boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
//           }}
//         >
//           <h2>🚗 Route Details</h2>

//           {recommended && (
//             <div
//               style={{
//                 marginBottom: "20px",
//                 padding: "15px",
//                 borderRadius: "12px",
//                 background: "#eef6ff",
//               }}
//             >
//               <h3>✅ Recommended Route</h3>

//               <p>
//                 <strong>Distance:</strong>{" "}
//                 {recommended.distance.toFixed(2)} km
//               </p>

//               <p>
//                 <strong>Estimated Time:</strong>{" "}
//                 {recommended.duration} mins
//               </p>

//               <p>
//                 <strong>Traffic:</strong>{" "}
//                 {recommended.traffic}
//               </p>
//             </div>
//           )}

//           {alternate && (
//             <div
//               style={{
//                 padding: "15px",
//                 borderRadius: "12px",
//                 background: "#fff4f4",
//               }}
//             >
//               <h3>🛣️ Alternate Route</h3>

//               <p>
//                 <strong>Distance:</strong>{" "}
//                 {alternate.distance.toFixed(2)} km
//               </p>

//               <p>
//                 <strong>Estimated Time:</strong>{" "}
//                 {alternate.duration} mins
//               </p>

//               <p>
//                 <strong>Traffic:</strong>{" "}
//                 {alternate.traffic}
//               </p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default RouteMap;

// import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// delete L.Icon.Default.prototype._getIconUrl;

// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl:
//     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl:
//     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// function RouteMap({ geometry }) {

//   if (!geometry || geometry.length === 0) {
//     return (
//       <div
//         style={{
//           height: "500px",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           border: "1px solid #ddd",
//           borderRadius: "12px",
//           marginTop: "20px"
//         }}
//       >
//         No Route Available
//       </div>
//     );
//   }

//   const route = geometry.map((point) => [
//     point[1],
//     point[0]
//   ]);

//   return (

//     <MapContainer

//       center={route[0]}

//       zoom={12}

//       style={{
//         height: "500px",
//         width: "100%",
//         borderRadius: "12px"
//       }}

//     >

//       <TileLayer
//         attribution="&copy; OpenStreetMap contributors"
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />

//       <Marker position={route[0]}>
//         <Popup>Source</Popup>
//       </Marker>

//       <Marker position={route[route.length - 1]}>
//         <Popup>Destination</Popup>
//       </Marker>

//       <Polyline
//         positions={route}
//         color="blue"
//         weight={6}
//       />

//     </MapContainer>

//   );

// }

// export default RouteMap;

import {
    MapContainer,
    TileLayer,
    Polyline,
    Marker,
    Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function RouteMap({

    recommendedRoute,

    alternateRoute,

}) {

    if (!recommendedRoute) {

        return null;

    }

    const recommendedCoordinates =
        recommendedRoute.geometry.map(
            ([lng, lat]) => [lat, lng]
        );

    const alternateCoordinates =
        alternateRoute
            ? alternateRoute.geometry.map(
                  ([lng, lat]) => [lat, lng]
              )
            : [];

    const start = recommendedCoordinates[0];

    const end =
        recommendedCoordinates[
            recommendedCoordinates.length - 1
        ];

    return (

        <MapContainer

            center={start}

            zoom={12}

            style={{

                height: "550px",

                width: "100%",

                borderRadius: "18px",

                marginTop: "30px",

            }}

        >

            <TileLayer

                attribution='&copy; OpenStreetMap'

                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

            />

            <Marker position={start}>

                <Popup>

                    Source

                </Popup>

            </Marker>

            <Marker position={end}>

                <Popup>

                    Destination

                </Popup>

            </Marker>

            <Polyline

                positions={recommendedCoordinates}

                pathOptions={{

                    color: "green",

                    weight: 7,

                }}

            />

            {

                alternateRoute && (

                    <Polyline

                        positions={alternateCoordinates}

                        pathOptions={{

                            color: "red",

                            weight: 6,

                            dashArray: "8,8",

                        }}

                    />

                )

            }

        </MapContainer>

    );

}

export default RouteMap;