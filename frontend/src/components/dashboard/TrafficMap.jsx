import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import { useEffect, useState } from "react";
import { predictLocation } from "../../services/mapPrediction";
import "../../styles/map.css";
import RoutePlanner from "./RoutePlanner";
import RouteRecommendation from "./RouteRecommendation";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "12px",
};

const center = {
  lat: 12.9716,
  lng: 77.5946,
};

const initialLocations = [
  {
    id: 1,
    name: "Whitefield",
    lat: 12.9698,
    lng: 77.7499,

    input: {
      Area_Name: "Whitefield",
      Road_Intersection_Name: "ITPL",
      Traffic_Category: "High",
      Traffic_Volume: 22000,
      Average_Speed: 24,
      Travel_Time_Index: 1.8,
      Road_Capacity_Utilization: 92,
      Incident_Reports: 2,
      Environmental_Impact: 74,
      Public_Transport_Usage: 41,
      Traffic_Signal_Compliance: 83,
      Parking_Usage: 66,
      Pedestrian_and_Cyclist_Count: 180,
      Year: 2023,
      Month: 9,
      Day: 15,
      DayOfWeek: 5,
      Weather: "Clear",
      Roadwork: false,
    },
  },

  {
    id: 2,
    name: "Electronic City",
    lat: 12.8456,
    lng: 77.6603,

    input: {
      Area_Name: "Electronic City",
      Road_Intersection_Name: "Phase 1",
      Traffic_Category: "High",
      Traffic_Volume: 26000,
      Average_Speed: 20,
      Travel_Time_Index: 2.0,
      Road_Capacity_Utilization: 95,
      Incident_Reports: 3,
      Environmental_Impact: 79,
      Public_Transport_Usage: 39,
      Traffic_Signal_Compliance: 80,
      Parking_Usage: 69,
      Pedestrian_and_Cyclist_Count: 160,
      Year: 2023,
      Month: 9,
      Day: 15,
      DayOfWeek: 5,
      Weather: "Clear",
      Roadwork: true,
    },
  },

  {
    id: 3,
    name: "Koramangala",
    lat: 12.9352,
    lng: 77.6245,

    input: {
      Area_Name: "Koramangala",
      Road_Intersection_Name: "80 Feet Road",
      Traffic_Category: "Medium",
      Traffic_Volume: 14000,
      Average_Speed: 39,
      Travel_Time_Index: 1.2,
      Road_Capacity_Utilization: 68,
      Incident_Reports: 1,
      Environmental_Impact: 45,
      Public_Transport_Usage: 57,
      Traffic_Signal_Compliance: 91,
      Parking_Usage: 54,
      Pedestrian_and_Cyclist_Count: 260,
      Year: 2023,
      Month: 9,
      Day: 15,
      DayOfWeek: 5,
      Weather: "Clear",
      Roadwork: false,
    },
  },

  {
    id: 4,
    name: "Indiranagar",
    lat: 12.9784,
    lng: 77.6408,

    input: {
      Area_Name: "Indiranagar",
      Road_Intersection_Name: "100 Feet Road",
      Traffic_Category: "Medium",
      Traffic_Volume: 17000,
      Average_Speed: 35,
      Travel_Time_Index: 1.3,
      Road_Capacity_Utilization: 72,
      Incident_Reports: 1,
      Environmental_Impact: 48,
      Public_Transport_Usage: 58,
      Traffic_Signal_Compliance: 90,
      Parking_Usage: 57,
      Pedestrian_and_Cyclist_Count: 210,
      Year: 2023,
      Month: 9,
      Day: 15,
      DayOfWeek: 5,
      Weather: "Cloudy",
      Roadwork: false,
    },
  },

  {
    id: 5,
    name: "M.G. Road",
    lat: 12.9758,
    lng: 77.6068,

    input: {
      Area_Name: "M.G. Road",
      Road_Intersection_Name: "Trinity Circle",
      Traffic_Category: "High",
      Traffic_Volume: 24000,
      Average_Speed: 27,
      Travel_Time_Index: 1.9,
      Road_Capacity_Utilization: 90,
      Incident_Reports: 2,
      Environmental_Impact: 72,
      Public_Transport_Usage: 69,
      Traffic_Signal_Compliance: 87,
      Parking_Usage: 76,
      Pedestrian_and_Cyclist_Count: 330,
      Year: 2023,
      Month: 9,
      Day: 15,
      DayOfWeek: 5,
      Weather: "Cloudy",
      Roadwork: false,
    },
  },

  {
    id: 6,
    name: "Hebbal",
    lat: 13.0358,
    lng: 77.5970,

    input: {
      Area_Name: "Hebbal",
      Road_Intersection_Name: "Hebbal Flyover",
      Traffic_Category: "High",
      Traffic_Volume: 25000,
      Average_Speed: 23,
      Travel_Time_Index: 2.1,
      Road_Capacity_Utilization: 94,
      Incident_Reports: 3,
      Environmental_Impact: 78,
      Public_Transport_Usage: 44,
      Traffic_Signal_Compliance: 84,
      Parking_Usage: 62,
      Pedestrian_and_Cyclist_Count: 170,
      Year: 2023,
      Month: 9,
      Day: 15,
      DayOfWeek: 5,
      Weather: "Clear",
      Roadwork: false,
    },
  },

  {
    id: 7,
    name: "Jayanagar",
    lat: 12.9250,
    lng: 77.5938,

    input: {
      Area_Name: "Jayanagar",
      Road_Intersection_Name: "South End Circle",
      Traffic_Category: "Low",
      Traffic_Volume: 11000,
      Average_Speed: 46,
      Travel_Time_Index: 1.0,
      Road_Capacity_Utilization: 56,
      Incident_Reports: 0,
      Environmental_Impact: 38,
      Public_Transport_Usage: 63,
      Traffic_Signal_Compliance: 95,
      Parking_Usage: 43,
      Pedestrian_and_Cyclist_Count: 310,
      Year: 2023,
      Month: 9,
      Day: 15,
      DayOfWeek: 5,
      Weather: "Clear",
      Roadwork: false,
    },
  },

  {
    id: 8,
    name: "Yeshwanthpur",
    lat: 13.0285,
    lng: 77.5400,

    input: {
      Area_Name: "Yeshwanthpur",
      Road_Intersection_Name: "Yeshwanthpur Circle",
      Traffic_Category: "Medium",
      Traffic_Volume: 18000,
      Average_Speed: 34,
      Travel_Time_Index: 1.4,
      Road_Capacity_Utilization: 74,
      Incident_Reports: 1,
      Environmental_Impact: 52,
      Public_Transport_Usage: 49,
      Traffic_Signal_Compliance: 89,
      Parking_Usage: 51,
      Pedestrian_and_Cyclist_Count: 220,
      Year: 2023,
      Month: 9,
      Day: 15,
      DayOfWeek: 5,
      Weather: "Cloudy",
      Roadwork: false,
    },
  },

  {
    id: 9,
    name: "Marathahalli",
    lat: 12.9591,
    lng: 77.6974,

    input: {
      Area_Name: "Marathahalli",
      Road_Intersection_Name: "Marathahalli Bridge",
      Traffic_Category: "High",
      Traffic_Volume: 23500,
      Average_Speed: 26,
      Travel_Time_Index: 1.9,
      Road_Capacity_Utilization: 91,
      Incident_Reports: 2,
      Environmental_Impact: 73,
      Public_Transport_Usage: 46,
      Traffic_Signal_Compliance: 86,
      Parking_Usage: 68,
      Pedestrian_and_Cyclist_Count: 205,
      Year: 2023,
      Month: 9,
      Day: 15,
      DayOfWeek: 5,
      Weather: "Cloudy",
      Roadwork: false,
    },
  },

  {
    id: 10,
    name: "Silk Board",
    lat: 12.9177,
    lng: 77.6238,

    input: {
      Area_Name: "Silk Board",
      Road_Intersection_Name: "Silk Board Junction",
      Traffic_Category: "High",
      Traffic_Volume: 28000,
      Average_Speed: 18,
      Travel_Time_Index: 2.4,
      Road_Capacity_Utilization: 97,
      Incident_Reports: 4,
      Environmental_Impact: 84,
      Public_Transport_Usage: 42,
      Traffic_Signal_Compliance: 81,
      Parking_Usage: 71,
      Pedestrian_and_Cyclist_Count: 190,
      Year: 2023,
      Month: 9,
      Day: 15,
      DayOfWeek: 5,
      Weather: "Rain",
      Roadwork: true,
    },
  },
];

function TrafficMap() {
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [origin, setOrigin] = useState(null);

  const [destination, setDestination] = useState(null);

  const heavyCount = locations.filter(
    (l) => l.prediction >= 70
  ).length;

  const moderateCount = locations.filter(
    (l) => l.prediction >= 40 && l.prediction < 70
  ).length;

  const lowCount = locations.filter(
    (l) => l.prediction !== null && l.prediction < 40
  ).length;

  const averageCongestion =
    locations.length > 0
      ? (
          locations.reduce(
            (sum, loc) => sum + (loc.prediction || 0),
            0
          ) / locations.length
        ).toFixed(1)
      : 0;

  const averageSpeed =
    locations.length > 0
      ? (
          locations.reduce(
            (sum, loc) => sum + loc.input.Average_Speed,
            0
          ) / locations.length
        ).toFixed(1)
      : 0;
  
  useEffect(() => {
    async function loadPredictions() {
      const updated = await Promise.all(
        initialLocations.map(async (location) => {
          try {
            const result = await predictLocation(location.input);

            return {
              ...location,
              prediction: result.congestion_prediction,
            };
          } catch {
            return {
              ...location,
              prediction: null,
            };
          }
        })
      );

      setLocations(updated);
      setLoading(false);
    }

    loadPredictions();
  }, []);


  function markerIcon(prediction) {
    if (prediction == null)
      return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";

    if (prediction < 40)
      return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

    if (prediction < 70)
      return "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";

    return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  }

  function congestionStatus(prediction) {
    if (prediction == null) return "Unavailable";

    if (prediction < 40) return "🟢 Low";

    if (prediction < 70) return "🟠 Moderate";

    return "🔴 Heavy";
  }

  function handleFindRoute(originId, destinationId) {

    console.log("Route button clicked");
    
    const start = locations.find(
        (loc) => loc.id === Number(originId)
    );

    const end = locations.find(
        (loc) => loc.id === Number(destinationId)
    );

    if (!start || !end) {
        alert("Select both locations");
        return;
    }

    setOrigin(start);

    setDestination(end);
    
    setSelected(end);

    console.log("Origin:", start.name);
    console.log("Destination:", end.name);
 }

  return ( 
  <>
    <div className="traffic-map-section">

          <div className="map-header">

              <div>

                  <h2>🗺️ AI Traffic Heat Map</h2>

                  <p>

                      Last Updated :
                      {" "}
                      {new Date().toLocaleString()}

                  </p>
                  
                  <p>
                      Live congestion prediction across Bangalore using Machine Learning.
                  </p>

              </div>

          </div>

          <div className="map-stats">

            <div className="map-stat-card">

              <h3>{locations.length}</h3>

              <span>Locations</span>

            </div>

            <div className="map-stat-card heavy">

              <h3>{heavyCount}</h3>

              <span>Heavy</span>

            </div>

            <div className="map-stat-card moderate">

              <h3>{moderateCount}</h3>

              <span>Moderate</span>

            </div>

            <div className="map-stat-card low">

              <h3>{lowCount}</h3>

              <span>Low</span>

            </div>

            <div className="map-stat-card">

              <h3>{averageCongestion}%</h3>

              <span>Average Congestion</span>

            </div>

            <div className="map-stat-card">

              <h3>{averageSpeed}</h3>

              <span>Avg Speed (km/h)</span>

            </div>

          </div>

      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      >
        
        <div className="map-legend">

          <span>🟢 Low</span>

          <span>🟠 Moderate</span>

          <span>🔴 Heavy</span>

        </div>
        
        {loading && (

        <div
            style={{
                textAlign: "center",
                fontWeight: "bold",
                marginBottom: "10px"
            }}
        >

        Loading AI Traffic Predictions...

        </div>

        )}
        
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={11}
        >
          {locations.map((location) => (
            <Marker
              key={location.id}
              position={{
                lat: location.lat,
                lng: location.lng,
              }}
              icon={markerIcon(location.prediction)}
              onClick={() => setSelected(location)}
            />
          ))}

          
          {selected && (
            <InfoWindow
              position={{
                lat: selected.lat,
                lng: selected.lng,
              }}
              onCloseClick={() => setSelected(null)}
            >
              <div style={{ minWidth: "220px" }}>
                <h3>{selected.name}</h3>

                <hr />

                <p>
                  <strong>Road:</strong>
                  <br />
                  {selected.input.Road_Intersection_Name}
                </p>

                <p>
                  <strong>Traffic Volume:</strong>{" "}
                  {selected.input.Traffic_Volume}
                </p>

                <p>
                  <strong>Average Speed:</strong>{" "}
                  {selected.input.Average_Speed} km/h
                </p>

                <p>
                  <strong>Weather:</strong>{" "}
                  {selected.input.Weather}
                </p>

                <hr />

                <h4
                    style={{
                        color:
                            selected.prediction >= 70
                                ? "#e53935"
                                : selected.prediction >= 40
                                ? "#ff9800"
                                : "#43a047"
                    }}
                >
                  AI Prediction:{" "}
                  {selected.prediction
                    ? `${selected.prediction.toFixed(2)}%`
                    : "N/A"}
                </h4>

                <strong>Status:</strong>{" "}
                {congestionStatus(selected.prediction)}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        <RoutePlanner
        locations={locations}
        onFindRoute={handleFindRoute}
        />

        <RouteRecommendation
          locations={locations}
          origin={origin}
          destination={destination}
        />

      </LoadScript>

    </div>
  </> );
}

export default TrafficMap;