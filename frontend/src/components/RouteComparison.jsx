import "../styles/RouteComparison.css";

function RouteComparison() {

  const routes = [

    {
      name: "Fastest Route",
      distance: "8.5 km",
      time: "15 mins",
      traffic: "Low",
      color: "#22c55e"
    },

    {
      name: "Alternate Route",
      distance: "9.3 km",
      time: "18 mins",
      traffic: "Moderate",
      color: "#f59e0b"
    },

    {
      name: "Scenic Route",
      distance: "11.2 km",
      time: "24 mins",
      traffic: "High",
      color: "#ef4444"
    }

  ];

  return (

    <div className="route-comparison">

      <h2>🚗 Route Comparison</h2>

      <div className="route-grid">

        {routes.map((route,index)=>(

          <div
            className="route-card"
            key={index}
          >

            <div
              className="route-color"
              style={{
                background:route.color
              }}
            />

            <h3>{route.name}</h3>

            <p><strong>Distance:</strong> {route.distance}</p>

            <p><strong>Travel Time:</strong> {route.time}</p>

            <p><strong>Traffic:</strong> {route.traffic}</p>

          </div>

        ))}

      </div>

    </div>

  );

}

export default RouteComparison;