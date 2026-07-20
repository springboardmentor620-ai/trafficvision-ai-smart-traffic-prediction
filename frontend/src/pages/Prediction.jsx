import { useState } from "react";
import { predictTraffic } from "../services/predictionService";

function Prediction() {

    const [prediction, setPrediction] = useState("");

    const handlePrediction = async () => {

        const data = {
            area_name: 2,
            road_name: 5,
            traffic_volume: 35000,
            average_speed: 35,
            travel_time_index: 1.5,
            road_capacity_utilization: 80,
            incident_reports: 1,
            environmental_impact: 70,
            public_transport_usage: 60,
            traffic_signal_compliance: 85,
            parking_usage: 75,
            pedestrian_count: 120,
            weather_conditions: 0,
            roadwork_activity: 0,
            year: 2022,
            month: 1,
            day: 15
        };

        try {

            const result = await predictTraffic(data);

            setPrediction(result.predicted_congestion_level);

        } catch (error) {

            console.log(error);

        }

    };

    return (

        <div style={{padding:"40px"}}>

            <h1>Traffic Prediction</h1>

            <button onClick={handlePrediction}>
                Predict Congestion
            </button>

            <h2>

                Predicted Congestion Level :

                {prediction}

            </h2>

        </div>

    );

}

export default Prediction;