import { useEffect, useState } from "react";

import { getBusiestRoads } from "../../services/analytics";

function RoadRankingTable() {

    const [roads, setRoads] = useState([]);

    useEffect(() => {

        let mounted = true;

        const loadRoads = async () => {

            try {

                const data = await getBusiestRoads();

                if (!mounted) return;

                setRoads(data);

            }

            catch (err) {

                console.error(err);

            }

        };

        loadRoads();

        return () => {

            mounted = false;

        };

    }, []);

    return (

        <div
            style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 3px 12px rgba(0,0,0,.08)"
            }}
        >

            <h2>Road Ranking</h2>

            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "20px"
                }}
            >

                <thead>

                    <tr>

                        <th>#</th>

                        <th>Road</th>

                        <th>Status</th>

                        <th>Vehicles</th>

                        <th>Average Speed</th>

                    </tr>

                </thead>

                <tbody>

                    {roads.map((road, index) => (

                        <tr key={road.id}>

                            <td>{index + 1}</td>

                            <td>{road.road}</td>

                            <td>{road.status}</td>

                            <td>{road.vehicles}</td>

                            <td>{road.average_speed} km/h</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default RoadRankingTable;