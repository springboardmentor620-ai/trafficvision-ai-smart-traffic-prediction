import { useState } from "react";

import AdminLayout from "../../components/dashboard/AdminLayout";

import { optimizeRoute } from "../../services/routes";

function RouteOptimization() {

    const [source, setSource] = useState("");

    const [destination, setDestination] = useState("");

    const [route, setRoute] = useState(null);

    const handleOptimize = async () => {

        if (!source || !destination) return;

        try {

            const data = await optimizeRoute(

                source,

                destination,

            );

            setRoute(data);

        }

        catch (err) {

            console.error(err);

        }

    };

    return (

        <AdminLayout

            title="Route Optimization"

            subtitle="AI assisted traffic routing"

        >

            <div
                style={{
                    background: "#fff",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 3px 12px rgba(0,0,0,.08)",
                }}
            >

                <h2>

                    Optimize Route

                </h2>

                <br />

                <input

                    placeholder="Source"

                    value={source}

                    onChange={(e) =>

                        setSource(e.target.value)

                    }

                />

                <br /><br />

                <input

                    placeholder="Destination"

                    value={destination}

                    onChange={(e) =>

                        setDestination(e.target.value)

                    }

                />

                <br /><br />

                <button

                    onClick={handleOptimize}

                >

                    Optimize Route

                </button>

            </div>

            {

                route && (

                    <div
                        style={{
                            marginTop: "30px",
                            background: "#fff",
                            padding: "25px",
                            borderRadius: "12px",
                            boxShadow: "0 3px 12px rgba(0,0,0,.08)",
                        }}
                    >

                        <h2>

                            Recommended Route

                        </h2>

                        <br />

                        {

                            route.recommended_route.map(

                                (road, index) => (

                                    <div
                                        key={index}
                                        style={{
                                            marginBottom: "12px",
                                            fontWeight: "bold",
                                        }}
                                    >

                                        {road}

                                    </div>

                                )

                            )

                        }

                        <hr />

                        <p>

                            Estimated Time :

                            <strong>

                                {" "}

                                {route.estimated_time}

                            </strong>

                        </p>

                        <p>

                            Distance :

                            <strong>

                                {" "}

                                {route.distance}

                            </strong>

                        </p>

                    </div>

                )

            }

        </AdminLayout>

    );

}

export default RouteOptimization;