function RouteRecommendation({

    locations,
    origin,
    destination

}) {

    if (

        !locations.length ||
        !origin ||
        !destination

    ) {

        return (

            <div
                style={{
                    marginTop: 20,
                    padding: 20,
                    borderRadius: 12,
                    background: "#ffffff",
                    boxShadow: "0 5px 15px rgba(0,0,0,.08)"
                }}
            >

                <h2>🤖 AI Route Recommendation</h2>

                <hr />

                <p>

                    Select an

                    <strong> Origin </strong>

                    and

                    <strong> Destination </strong>

                    then click

                    <strong> Find Best Route </strong>

                    to generate an AI recommendation.

                </p>

            </div>

        );

    }

    const estimatedTime = Math.round(

        (
            origin.input.Traffic_Volume +
            destination.input.Traffic_Volume
        ) / 2000 +

        (
            origin.prediction +
            destination.prediction
        ) / 15

    );

    const delay = Math.round(

        (
            origin.prediction +
            destination.prediction
        ) / 25

    );

    const avgPrediction =

        (
            origin.prediction +
            destination.prediction
        ) / 2;

    let congestion = "🟢 Low";

    if (avgPrediction >= 70)

        congestion = "🔴 Heavy";

    else if (avgPrediction >= 40)

        congestion = "🟠 Moderate";

    const confidence =

        Math.max(

            70,

            Math.round(

                100 - avgPrediction / 3

            )

        );

    let stars = 5;

    if (avgPrediction >= 80)

        stars = 1;

    else if (avgPrediction >= 60)

        stars = 2;

    else if (avgPrediction >= 40)

        stars = 3;

    else if (avgPrediction >= 20)

        stars = 4;

    return (

        <div
            style={{
                margin: "30px auto",
                padding: "30px",
                maxWidth: "900px",
                borderRadius: "18px",
                background: "#fff",
                boxShadow: "0 8px 25px rgba(0,0,0,.12)"
            }}
        >

            <h2
                style={{
                    color: "#1976d2"
                }}
            >

                🤖 AI Route Recommendation

            </h2>

            <hr />

            <h3>

                {origin.name}

                {"  →  "}

                {destination.name}

            </h3>

            <br />

            <p>

                <strong>

                    Recommended Route

                </strong>

            </p>

            <br />

            <div
                style={{
                    lineHeight: "2",
                    fontSize: "17px",
                    textAlign: "center",
                    fontWeight: "600"
                }}
            >

            🚩 {origin.name}

            <br/>

            ⬇

            <br/>

            🛣 {origin.input.Road_Intersection_Name}

            <br/>

            ⬇

            <br/>

            🛣 {destination.input.Road_Intersection_Name}

            <br/>

            ⬇

            <br/>

            🏁 {destination.name}

            </div>

            <hr />

            <p>

                <strong>

                    Estimated Travel Time :

                </strong>

                {" "}

                {estimatedTime}

                {" "}

                mins

            </p>

            <p>

                <strong>

                    Expected Delay :

                </strong>

                {" "}

                {delay}

                {" "}

                mins

            </p>

            <p>

                <strong>

                    Predicted Congestion :

                </strong>

                {" "}

                {congestion}

            </p>

            <p>

                <strong>AI Confidence</strong>

            </p>

            <div
                style={{
                    width: "100%",
                    background: "#eee",
                    borderRadius: "10px",
                    overflow: "hidden",
                    marginBottom: "15px"
                }}
            >

                <div
                    style={{
                        width: `${confidence}%`,
                        background: "#4CAF50",
                        color: "white",
                        padding: "8px",
                        textAlign: "center",
                        fontWeight: "bold"
                    }}
                >

                    {confidence}%

                </div>

            </div>

            <p>

                <strong>

                    Route Quality :

                </strong>

                {" "}

                {"⭐".repeat(stars)}

                {"☆".repeat(5 - stars)}

            </p>

            <hr />

            <h4
                style={{
                    color:"#1976d2"
                }}
            >

            💡 AI Recommendation

            </h4>

            <ul>

                <li>

                    Recommended travel from

                    <strong>

                        {" "}

                        {origin.name}

                    </strong>

                    {" "}

                    to

                    <strong>

                        {" "}

                        {destination.name}

                    </strong>

                    .

                </li>

                <li>

                    Average congestion is

                    {" "}

                    <strong>

                        {avgPrediction.toFixed(2)}%

                    </strong>

                    .

                </li>

                <li>

                    Expected delay is

                    {" "}

                    <strong>

                        {delay} minutes

                    </strong>

                    .

                </li>

            </ul>

        </div>

    );

}

export default RouteRecommendation;