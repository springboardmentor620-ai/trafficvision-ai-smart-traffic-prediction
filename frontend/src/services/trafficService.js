const API_URL = "http://127.0.0.1:8000";

export async function getTrafficStatistics() {
  const response = await fetch(`${API_URL}/traffic/statistics`);
  return await response.json();
}

export async function getTrafficRecords() {
  const response = await fetch(`${API_URL}/traffic/`);
  return await response.json();
}

export async function searchTraffic(weather, condition) {
  const response = await fetch(
    `${API_URL}/traffic/search?weather=${weather}&condition=${condition}`
  );

  return await response.json();
}