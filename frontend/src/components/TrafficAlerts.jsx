import "../styles/TrafficAlerts.css";

function TrafficAlerts() {

  const alerts = [

    {
      type: "High",
      area: "Electronic City",
      message: "Heavy congestion detected. Consider an alternate route."
    },

    {
      type: "Medium",
      area: "Whitefield",
      message: "Traffic is increasing during peak hours."
    },

    {
      type: "Low",
      area: "Jayanagar",
      message: "Traffic flow is normal."
    }

  ];

  return (

    <div className="alerts">

      <h2>🚨 Live Traffic Alerts</h2>

      {
        alerts.map((alert,index)=>(

          <div
            key={index}
            className={`alert ${alert.type.toLowerCase()}`}
          >

            <h3>{alert.area}</h3>

            <p>{alert.message}</p>

          </div>

        ))
      }

    </div>

  );

}

export default TrafficAlerts;