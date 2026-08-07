// import Navbar from "../components/layout/Navbar";
// import Footer from "../components/layout/Footer";
// import RouteRecommendation from "../components/RouteRecommendation";
// import { getAreas } from "../services/trafficService";
// import { useEffect, useState } from "react";

// function Recommendations() {

//     const [prediction, setPrediction] = useState(null);

//     useEffect(() => {

//         const data = JSON.parse(
//             localStorage.getItem("latestPrediction")
//         );

//         setPrediction(data);

//     }, []);

//   const loadAreas = async () => {
//     try {
//       const data = await getAreas();
//       setAreas(data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <>
//       <Navbar />

//       <div className="dashboard">
//         <h1 style={{ textAlign: "center", color: "#1e3a8a" }}>
//           🛣 Smart Route Recommendations
//         </h1>

//         <p
//           style={{
//             textAlign: "center",
//             color: "#666",
//             marginBottom: "35px",
//           }}
//         >
//           Find the fastest route using OpenStreetMap and AI.
//         </p>

//         <RouteRecommendation areas={areas} />
//       </div>

//       <Footer />
//     </>
//   );
// }

// export default Recommendations;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import RouteRecommendation from "../components/RouteRecommendation";

import { getRoute } from "../services/routeService";

function Recommendations() {

  const navigate = useNavigate();

  const [prediction, setPrediction] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const savedPrediction = JSON.parse(
      localStorage.getItem("latestPrediction")
    );

    if (!savedPrediction) {

      navigate("/prediction");
      return;

    }

    setPrediction(savedPrediction);

    loadRoute(savedPrediction);

  }, []);

  const loadRoute = async (data) => {

    try {

      setLoading(true);

      const response = await getRoute(
        data.source,
        data.destination
      );

      setRouteData(response);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  if (loading) {

    return (

      <>
        <Navbar />

        <div
          style={{
            padding: "120px",
            textAlign: "center",
            fontSize: "22px",
            fontWeight: "600"
          }}
        >
          🚦 Loading Best Route...
        </div>

        <Footer />
      </>

    );

  }

  return (

    <>

      <Navbar />

      <div className="dashboard">

        <h1
          style={{
            textAlign: "center",
            color: "#1e3a8a"
          }}
        >
          🛣 AI Route Recommendations
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#28538f",
            marginBottom: "30px"
          }}
        >
          Route generated automatically from your prediction.
        </p>

        <RouteRecommendation

          prediction={prediction}

          routeData={routeData}

        />

      </div>

      <Footer />

    </>

  );

}

export default Recommendations;

// import { useEffect, useState } from "react";
// import Navbar from "../components/layout/Navbar";
// import Footer from "../components/layout/Footer";
// import RouteRecommendation from "../components/RouteRecommendation";

// function Recommendations() {

//   const [prediction, setPrediction] = useState(null);

//   useEffect(() => {

//     const data = JSON.parse(
//       localStorage.getItem("latestPrediction")
//     );
//     console.log("Latest Prediction:", data);
//     if (data) {
//       setPrediction(data);
//     }

//   }, []);

//   return (

//     <>

//       <Navbar />

//       <div
//         style={{
//           padding: "30px",
//           maxWidth: "1400px",
//           margin: "0 auto"
//         }}
//       >

//         <h1
//           style={{
//             textAlign: "center",
//             color: "#1e40af",
//             marginBottom: "10px"
//           }}
//         >
//           🛣 AI Route Recommendations
//         </h1>

//         <p
//           style={{
//             textAlign: "center",
//             color: "#666",
//             marginBottom: "30px"
//           }}
//         >
//           Best route generated using OpenRouteService
//         </p>

//         {!prediction ? (

//           <div
//             style={{
//               textAlign: "center",
//               padding: "80px"
//             }}
//           >

//             <h2>No Prediction Found</h2>

//             <p>
//               Please predict congestion first.
//             </p>

//           </div>

//         ) : (

//           <>

//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 gap: "30px",
//                 marginBottom: "25px",
//                 fontWeight: "bold",
//                 fontSize: "18px"
//               }}
//             >

//               <div>
//                 📍 Source :
//                 <span
//                   style={{
//                     color: "#2563eb"
//                   }}
//                 >
//                   {" "}
//                   {prediction.source}
//                 </span>
//               </div>

//               <div>
//                 🎯 Destination :
//                 <span
//                   style={{
//                     color: "#16a34a"
//                   }}
//                 >
//                   {" "}
//                   {prediction.destination}
//                 </span>
//               </div>

//             </div>

//             <RouteRecommendation />

//           </>

//         )}

//       </div>

//       <Footer />

//     </>

//   );

// }

// export default Recommendations;