function TravelTime({ trafficData, prediction }) {

  if (!trafficData) {
    return null;
  }

  const currentTime = Number(
    trafficData["Travel Time Index"] * 10
  ).toFixed(0);

  let savedTime = 0;

  if (prediction >= 75) {
    savedTime = 12;
  } else if (prediction >= 50) {
    savedTime = 8;
  } else {
    savedTime = 4;
  }

  const alternateTime = currentTime - savedTime;

  return (

    <div className="travel-card">

      <h2>⏱ Travel Time Estimation</h2>

      <div className="travel-grid">

        <div className="travel-box">
          <h3>Current Route</h3>
          <h1>{currentTime} mins</h1>
        </div>

        <div className="travel-box">
          <h3>Alternate Route</h3>
          <h1>{alternateTime} mins</h1>
        </div>

        <div className="travel-box">
          <h3>Time Saved</h3>
          <h1>{savedTime} mins</h1>
        </div>

      </div>

    </div>

  );

}

export default TravelTime;