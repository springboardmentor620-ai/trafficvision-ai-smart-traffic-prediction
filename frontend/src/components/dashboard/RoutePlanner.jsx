import { useState } from "react";

function RoutePlanner({
    locations = [],
    onFindRoute
}) {

    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");

    return (

        <div
            className="prediction-panel"
            style={{
                maxWidth: "900px",
                margin: "30px auto",
                padding: "30px"
            }}
        >

            <h2
                style={{
                    textAlign: "center",
                    marginBottom: "25px"
                }}
            >
                🛣 Route Planner
            </h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 220px",
                    gap: "15px",
                    alignItems: "center"
                }}
            >

                <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                >

                    <option value="">
                        Select Origin
                    </option>

                    {locations.map((loc) => (

                        <option
                            key={loc.id}
                            value={loc.id}
                        >

                            {loc.name}

                        </option>

                    ))}

                </select>

                <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                >

                    <option value="">
                        Select Destination
                    </option>

                    {locations.map((loc) => (

                        <option
                            key={loc.id}
                            value={loc.id}
                        >

                            {loc.name}

                        </option>

                    ))}

                </select>

                <button
                    style={{
                        height: "42px"
                    }}
                    onClick={() =>
                        onFindRoute(origin, destination)
                    }
                >
                    🚗 Find Best Route
                </button>

            </div>

        </div>

    );

}

export default RoutePlanner;