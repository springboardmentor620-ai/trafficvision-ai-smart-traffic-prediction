const API_URL = "http://127.0.0.1:8000";

async function requestJson(path, options) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error("Unable to reach the TrafficVision API.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof payload?.detail === "string" ? payload.detail : "The request could not be completed.");
  }
  return payload;
}

export async function getTrafficStatistics() {
  return requestJson("/traffic/statistics");
}

export async function getTrafficRecords() {
  return requestJson("/traffic/");
}

export async function getAlerts() {
  return requestJson("/alerts");
}

export async function getAnalytics() {
  return requestJson("/analytics");
}

export async function getHeatmap() {
  return requestJson("/heatmap");
}

export async function getAiRecommendations() {
  return requestJson("/ai/recommendations");
}

export async function predictTrafficCondition(payload) {
  return requestJson("/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}

export async function getReport(period) {
  return requestJson(`/reports?period=${encodeURIComponent(period)}`);
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

export async function getPredictionOptions() {
  return requestJson("/traffic/prediction-options");
}

export async function getDatasetCountries() { return requestJson("/locations/countries"); }
export async function getDatasetStates(country) { return requestJson(`/locations/states/${encodeURIComponent(country)}`); }
export async function getDatasetCities(state) { return requestJson(`/locations/cities/${encodeURIComponent(state)}`); }
export async function getDatasetRoads(city) { return requestJson(`/locations/roads/${encodeURIComponent(city)}`); }

export async function authenticate(payload, signup = false) {
  return requestJson(`/auth/${signup ? "signup" : "login"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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
