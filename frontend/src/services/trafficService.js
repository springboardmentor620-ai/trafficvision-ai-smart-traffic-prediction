const API_URL = "http://127.0.0.1:8000";

async function requestJson(path, options) {
  const response = await fetch(`${API_URL}${path}`, options);
  return response.json();
}

export async function getTrafficStatistics() {
  return requestJson("/traffic/statistics");
}

export async function getTrafficRecords() {
  return requestJson("/traffic/");
}

export async function searchTraffic(weather, condition) {
  return requestJson(
    `/traffic/search?weather=${encodeURIComponent(
      weather
    )}&condition=${encodeURIComponent(condition)}`
  );
}

export async function getTrafficMap() {
  return requestJson("/traffic/map");
}

export async function getAreas() {
  return requestJson("/traffic/areas");
}

export async function getRoads(area) {
  return requestJson(
    `/traffic/roads?area=${encodeURIComponent(area)}`
  );
}

export async function recommendRoute(
  sourceArea,
  sourceRoad,
  destinationArea,
  destinationRoad,
  vehicle
) {
  return requestJson("/route/recommend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_area: sourceArea,
      source_road: sourceRoad,
      destination_area: destinationArea,
      destination_road: destinationRoad,
      vehicle_type: vehicle,
    }),
  });
}
