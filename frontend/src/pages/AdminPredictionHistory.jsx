import { useEffect, useState } from "react";
import { getPredictions } from "../services/adminPredictionService";

function AdminPredictionHistory() {

    const [predictions, setPredictions] = useState([]);

    useEffect(() => {

        loadPredictions();

    }, []);

    const loadPredictions = async () => {

        try {

            const data = await getPredictions();

            setPredictions(data);

        } catch (err) {

            console.log(err);

        }

    };

    return (

        <div className="admin-page">

            <h1>🧠 Prediction History</h1>

            <table className="prediction-table">

                <thead>

                    <tr>

                        <th>Source</th>

                        <th>Destination</th>

                        <th>Distance</th>

                        <th>Time</th>

                        <th>Traffic</th>

                        <th>Congestion</th>

                        <th>Severity</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        predictions.map((item) => (

                            <tr key={item._id}>

                                <td>{item.source}</td>

                                <td>{item.destination}</td>

                                <td>{item.distance} km</td>

                                <td>{item.duration} mins</td>

                                <td>{item.traffic_level}</td>

                                <td>{item.predicted_congestion}%</td>

                                <td>{item.severity}</td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}

export default AdminPredictionHistory;