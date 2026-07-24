const token = localStorage.getItem('tv_token');
const role = localStorage.getItem('tv_role');
const username = localStorage.getItem('tv_username');

if (!token) {
  window.location.href = 'index.html';
}

document.getElementById('usernameLabel').textContent = username;
const roleBadge = document.getElementById('roleBadge');
roleBadge.textContent = role;
roleBadge.classList.add(role);

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

const LEVEL_COLOR = { low: 'var(--cyan)', medium: 'var(--amber)', high: 'var(--red)' };
const LEVEL_HEX = { low: '#3FD0C9', medium: '#F2A93B', high: '#F0553A' };
const LEVEL_SPEED = { low: '2.6s', medium: '1.6s', high: '0.8s' };

async function authedFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Session expired');
  }
  return res;
}

function timeAgo(isoString) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(isoString + 'Z')) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/* =========================================================
   PAGE NAVIGATION (sidebar)
   ========================================================= */
const PAGE_TITLES = {
  'page-dashboard': 'Dashboard',
  'page-monitoring': 'Traffic Monitoring',
  'page-map': 'Live Map',
  'page-roads': 'Road Management',
  'page-navigation': 'Navigation',
  'page-forecasting': 'Forecasting',
  'page-reports': 'Reports',
  'page-users': 'User Management',
  'page-profile': 'Profile',
};

const navItems = document.querySelectorAll('.nav-item[data-page]');
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  navItems.forEach(n => n.classList.toggle('active', n.dataset.page === pageId));
  document.getElementById('pageHeaderTitle').textContent = PAGE_TITLES[pageId] || 'Dashboard';

  if (pageId === 'page-map') initOrRefreshMap();
  if (pageId === 'page-profile') loadProfile();
  if (pageId === 'page-users') loadUsers();
}
navItems.forEach(item => {
  item.addEventListener('click', () => showPage(item.dataset.page));
});

/* Role-based nav visibility */
if (role === 'admin') {
  document.getElementById('userMgmtNavItem').style.display = 'flex';
  document.getElementById('adminNavLabel').style.display = 'block';
}
if (role === 'admin' || role === 'operator') {
  document.getElementById('operatorPanel').style.display = 'block';
}

/* =========================================================
   LIVE TRAFFIC MONITORING (Dashboard + Monitoring pages)
   ========================================================= */
function renderRoadCards(container, data) {
  if (!data.length) {
    container.innerHTML = '<div class="empty-state">No roads configured yet. Add one in Road Management.</div>';
    return;
  }
  container.innerHTML = data.map(r => `
    <div class="road-card" style="--level-color:${LEVEL_COLOR[r.congestion_level]}">
      <p class="road-name">${escapeHtml(r.road_name)}</p>
      <p class="road-loc">${escapeHtml(r.location || '—')}</p>
      <div class="beacon-row" style="--beacon-speed:${LEVEL_SPEED[r.congestion_level]}">
        <span class="beacon"></span>
        <span class="level-label">${r.congestion_level} congestion</span>
      </div>
      <div class="metric-row"><span>Vehicle count</span><span class="metric-value">${r.vehicle_count}</span></div>
      <div class="metric-row"><span>Avg. speed</span><span class="metric-value">${r.avg_speed_kmph} km/h</span></div>
      <p class="updated-at mono">updated ${timeAgo(r.recorded_at)}</p>
    </div>
  `).join('');
}

let lastLiveData = [];
async function loadLiveTraffic() {
  try {
    const res = await authedFetch('/traffic/live');
    const data = await res.json();
    lastLiveData = data;

    renderRoadCards(document.getElementById('roadGrid'), data);
    renderRoadCards(document.getElementById('roadGridPreview'), data);

    document.getElementById('statTotalRoads').textContent = data.length;
    document.getElementById('statHigh').textContent = data.filter(r => r.congestion_level === 'high').length;
    document.getElementById('statMedium').textContent = data.filter(r => r.congestion_level === 'medium').length;
    document.getElementById('statLow').textContent = data.filter(r => r.congestion_level === 'low').length;

    updateMapMarkers(data);
  } catch (e) {
    console.error(e);
  }
}
loadLiveTraffic();
setInterval(loadLiveTraffic, 5000);

/* =========================================================
   LIVE MAP (Leaflet + OpenStreetMap tiles)
   ========================================================= */
let leafletMap = null;
let mapMarkers = {}; // road_id -> marker
let roadCoordsById = {}; // road_id -> {lat, lon, name, location}

async function loadRoadCoords() {
  try {
    const res = await authedFetch('/traffic/roads');
    const roads = await res.json();
    roadCoordsById = {};
    roads.forEach(r => { roadCoordsById[r.id] = r; });
    return roads;
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function initOrRefreshMap() {
  const mapDiv = document.getElementById('leafletMap');

  if (typeof L === 'undefined') {
    mapDiv.innerHTML = `<div class="empty-state" style="padding:60px 20px;">
      Could not load the map library (Leaflet) from its CDN.<br/>
      Check your internet connection and reload the page — this page requires
      an internet connection to fetch map tiles and the Leaflet library itself.
    </div>`;
    return;
  }

  await loadRoadCoords();
  const roadsWithCoords = Object.values(roadCoordsById).filter(r => r.latitude != null && r.longitude != null);

  try {
    if (!leafletMap) {
      leafletMap = L.map('leafletMap');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(leafletMap);
    }

    if (roadsWithCoords.length) {
      const bounds = L.latLngBounds(roadsWithCoords.map(r => [r.latitude, r.longitude]));
      leafletMap.fitBounds(bounds, { padding: [40, 40] });
    } else {
      leafletMap.setView([20.0, 78.0], 4);
    }

    updateMapMarkers(lastLiveData);
  } catch (e) {
    console.error('Map init failed:', e);
    mapDiv.innerHTML = `<div class="empty-state" style="padding:60px 20px;">Map failed to load: ${e.message}</div>`;
  }
}

function updateMapMarkers(liveData) {
  if (!leafletMap || !liveData || !liveData.length) return;

  liveData.forEach(r => {
    const road = roadCoordsById[r.road_id];
    if (!road || road.latitude == null || road.longitude == null) return;

    const color = LEVEL_HEX[r.congestion_level] || '#7C8CA0';
    if (mapMarkers[r.road_id]) {
      mapMarkers[r.road_id].setStyle({ color, fillColor: color });
      mapMarkers[r.road_id].setPopupContent(popupHtml(r));
    } else {
      const marker = L.circleMarker([road.latitude, road.longitude], {
        radius: 10, color, fillColor: color, fillOpacity: 0.85, weight: 2,
      }).addTo(leafletMap);
      marker.bindPopup(popupHtml(r));
      mapMarkers[r.road_id] = marker;
    }
  });
}

function popupHtml(r) {
  return `<strong>${escapeHtml(r.road_name)}</strong><br/>${escapeHtml(r.location || '')}<br/>` +
         `Congestion: <b>${r.congestion_level}</b><br/>Vehicles: ${r.vehicle_count} · ${r.avg_speed_kmph} km/h`;
}

/* =========================================================
   ROAD MANAGEMENT (list + add + edit + delete)
   ========================================================= */
let editingRoadId = null;

async function loadRoadsTable() {
  try {
    const res = await authedFetch('/traffic/roads');
    const roads = await res.json();
    const tbody = document.querySelector('#roadsTable tbody');
    const canEdit = role === 'admin' || role === 'operator';
    tbody.innerHTML = roads.map(r => `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.location || '—')}</td>
        <td class="mono">${r.lane_capacity}</td>
        <td class="mono">${r.latitude != null ? r.latitude.toFixed(4) + ', ' + r.longitude.toFixed(4) : '—'}</td>
        <td>${canEdit ? `
          <button class="icon-btn" data-edit="${r.id}">Edit</button>
          <button class="icon-btn danger" data-delete="${r.id}">Delete</button>
        ` : ''}</td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = roads.find(x => x.id == btn.dataset.edit);
        editingRoadId = r.id;
        document.getElementById('roadName').value = r.name;
        document.getElementById('roadLocation').value = r.location || '';
        document.getElementById('roadCapacity').value = r.lane_capacity;
        document.getElementById('roadLat').value = r.latitude ?? '';
        document.getElementById('roadLon').value = r.longitude ?? '';
        roadForm.querySelector('button[type="submit"]').textContent = 'Update road';
        document.getElementById('operatorPanel').scrollIntoView({ behavior: 'smooth' });
      });
    });
    tbody.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this road and all its historical readings?')) return;
        await authedFetch(`/traffic/roads/${btn.dataset.delete}`, { method: 'DELETE' });
        loadRoadsTable();
        refreshAllRoadSelects();
      });
    });
  } catch (e) {
    console.error(e);
  }
}

const roadForm = document.getElementById('roadForm');
if (roadForm) {
  roadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('roadName').value.trim();
    const location = document.getElementById('roadLocation').value.trim();
    const lane_capacity = parseInt(document.getElementById('roadCapacity').value, 10);
    const latRaw = document.getElementById('roadLat').value;
    const lonRaw = document.getElementById('roadLon').value;
    const latitude = latRaw ? parseFloat(latRaw) : null;
    const longitude = lonRaw ? parseFloat(lonRaw) : null;

    try {
      const isEditing = editingRoadId !== null;
      const res = await authedFetch(isEditing ? `/traffic/roads/${editingRoadId}` : '/traffic/roads', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, lane_capacity, latitude, longitude }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Could not save road');
      }
      roadForm.reset();
      document.getElementById('roadCapacity').value = 100;
      editingRoadId = null;
      roadForm.querySelector('button[type="submit"]').textContent = 'Add road';
      loadRoadsTable();
      refreshAllRoadSelects();
      loadLiveTraffic();
    } catch (err) {
      alert(err.message);
    }
  });
}

function refreshAllRoadSelects() {
  populateRouteRoadSelects();
  populatePredictionRoadSelect();
  populateReportRoadSelect();
}

/* =========================================================
   USER MANAGEMENT
   ========================================================= */
async function loadUsers() {
  if (role !== 'admin') return;
  try {
    const res = await authedFetch('/users');
    const users = await res.json();
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = users.map(u => `
      <tr>
        <td class="mono">${escapeHtml(u.username)}</td>
        <td>${escapeHtml(u.full_name || '—')}</td>
        <td>${escapeHtml(u.role)}</td>
        <td>${u.is_active ? 'active' : 'disabled'}</td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

const createUserForm = document.getElementById('createUserForm');
if (createUserForm) {
  createUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('createUserMsg');
    msg.textContent = '';
    msg.style.color = '';

    const username_ = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const roleValue = document.getElementById('newRole').value;

    try {
      const res = await authedFetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username_, password, role: roleValue }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Could not create account');
      }
      createUserForm.reset();
      msg.textContent = `Account "${username_}" created as ${roleValue}.`;
      msg.style.color = 'var(--cyan)';
      loadUsers();
    } catch (err) {
      msg.textContent = err.message;
      msg.style.color = 'var(--red)';
    }
  });
}

/* =========================================================
   PROFILE
   ========================================================= */
async function loadProfile() {
  try {
    const res = await authedFetch('/users/me');
    const u = await res.json();
    document.getElementById('profileUsername').value = u.username;
    document.getElementById('profileRole').value = u.role;
    document.getElementById('profileFullName').value = u.full_name || '';
    document.getElementById('profileEmail').value = u.email || '';
  } catch (e) {
    console.error(e);
  }
}

const profileForm = document.getElementById('profileForm');
if (profileForm) {
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('profileMsg');
    const full_name = encodeURIComponent(document.getElementById('profileFullName').value.trim());
    const email = encodeURIComponent(document.getElementById('profileEmail').value.trim());
    try {
      const res = await authedFetch(`/users/me?full_name=${full_name}&email=${email}`, { method: 'PUT' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Could not update profile');
      }
      msg.textContent = 'Profile updated.';
      msg.style.color = 'var(--cyan)';
    } catch (err) {
      msg.textContent = err.message;
      msg.style.color = 'var(--red)';
    }
  });
}

/* =========================================================
   NAVIGATION (Route Analysis)
   ========================================================= */
async function populateRouteRoadSelects() {
  try {
    const res = await authedFetch('/traffic/roads');
    const roads = await res.json();
    const options = roads.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');
    document.getElementById('originRoadSelect').innerHTML = options;
    document.getElementById('destRoadSelect').innerHTML = options;
    document.getElementById('conditionRoadSelect').innerHTML = options;
    if (roads.length > 1) document.getElementById('destRoadSelect').value = roads[1].id;
  } catch (e) {
    console.error(e);
  }
}
populateRouteRoadSelects();

document.getElementById('planRouteBtn').addEventListener('click', async () => {
  const originId = document.getElementById('originRoadSelect').value;
  const destId = document.getElementById('destRoadSelect').value;
  const msg = document.getElementById('routeMsg');
  const resultsBox = document.getElementById('routeResults');
  resultsBox.style.display = 'none';
  msg.style.color = '';
  msg.textContent = 'Finding route…';

  try {
    const res = await authedFetch(`/routes/plan?origin_road_id=${originId}&destination_road_id=${destId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Could not find a route.');

    msg.textContent = '';
    resultsBox.style.display = 'block';
    const tbody = document.querySelector('#routesTable tbody');
    tbody.innerHTML = data.routes.map((r, i) => `
      <tr style="${i === data.recommended_route_index ? 'color:var(--cyan);font-weight:600;' : ''}">
        <td>${r.label}${i === data.recommended_route_index ? ' ★ recommended' : ''}</td>
        <td class="mono">${r.distance_km} km</td>
        <td class="mono">${r.base_duration_minutes} min</td>
        <td class="mono">${r.congestion_adjusted_duration_minutes} min</td>
        <td>${r.congestion_factor_applied}</td>
      </tr>
    `).join('');
  } catch (err) {
    msg.textContent = err.message;
    msg.style.color = 'var(--red)';
  }
});

document.getElementById('checkConditionBtn').addEventListener('click', async () => {
  const roadId = document.getElementById('conditionRoadSelect').value;
  const result = document.getElementById('conditionResult');
  result.style.color = '';
  result.textContent = 'Checking…';
  try {
    const res = await authedFetch(`/routes/road-condition/${roadId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Could not check condition.');
    result.textContent =
      `${data.road_name}: ${data.condition} (${data.congestion_level} congestion, ${data.avg_speed_kmph} km/h) — as of ${data.as_of}`;
    result.style.color = LEVEL_COLOR[data.congestion_level] || '';
  } catch (err) {
    result.textContent = err.message;
    result.style.color = 'var(--red)';
  }
});

/* =========================================================
   FORECASTING (Traffic Prediction)
   ========================================================= */
const trainModelBtn = document.getElementById('trainModelBtn');
if (role === 'viewer' && trainModelBtn) {
  trainModelBtn.style.display = 'none';
}

async function populatePredictionRoadSelect() {
  try {
    const res = await authedFetch('/traffic/roads');
    const roads = await res.json();
    const select = document.getElementById('predictionRoadSelect');
    select.innerHTML = roads.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');
    const kaggleRoad = roads.find(r => r.name.includes('I-94'));
    if (kaggleRoad) select.value = kaggleRoad.id;
  } catch (e) {
    console.error(e);
  }
}
populatePredictionRoadSelect();

function setPredictionMsg(text, isError = false) {
  const msg = document.getElementById('predictionMsg');
  msg.textContent = text;
  msg.style.color = isError ? 'var(--red)' : 'var(--cyan)';
}

if (trainModelBtn) {
  trainModelBtn.addEventListener('click', async () => {
    const roadId = document.getElementById('predictionRoadSelect').value;
    if (!roadId) return;
    setPredictionMsg('Training model on historical database readings…');
    try {
      const res = await authedFetch(`/prediction/train/${roadId}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Training failed');
      setPredictionMsg(
        `Model trained on ${data.training_readings_used} historical readings — ` +
        `Mean Absolute Error: ${data.mean_absolute_error} vehicles, R² score: ${data.r2_score}`
      );
    } catch (err) {
      setPredictionMsg(err.message, true);
    }
  });
}

document.getElementById('forecastBtn').addEventListener('click', async () => {
  const roadId = document.getElementById('predictionRoadSelect').value;
  const hours = document.getElementById('forecastHours').value || 24;
  if (!roadId) return;
  setPredictionMsg('Generating forecast…');
  try {
    const res = await authedFetch(`/prediction/report/${roadId}?hours=${hours}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Forecast failed — train a model for this road first.');

    setPredictionMsg('');
    document.getElementById('predictionSummary').style.display = 'block';
    document.getElementById('peakHourText').textContent =
      `${data.peak_hour.forecast_time} — ${data.peak_hour.predicted_vehicle_count} vehicles (${data.peak_hour.predicted_congestion_level})`;
    document.getElementById('quietHourText').textContent =
      `${data.quietest_hour.forecast_time} — ${data.quietest_hour.predicted_vehicle_count} vehicles (${data.quietest_hour.predicted_congestion_level})`;

    const table = document.getElementById('forecastTable');
    table.style.display = 'table';
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = data.forecast.map(f => `
      <tr>
        <td class="mono">${f.forecast_time}</td>
        <td class="mono">${f.predicted_vehicle_count}</td>
        <td style="color:${LEVEL_COLOR[f.predicted_congestion_level]}">${f.predicted_congestion_level}</td>
      </tr>
    `).join('');
  } catch (err) {
    setPredictionMsg(err.message, true);
  }
});

/* =========================================================
   REPORTS
   ========================================================= */
async function populateReportRoadSelect() {
  try {
    const res = await authedFetch('/traffic/roads');
    const roads = await res.json();
    document.getElementById('reportRoadSelect').innerHTML =
      roads.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');
  } catch (e) {
    console.error(e);
  }
}
populateReportRoadSelect();

document.getElementById('downloadReportBtn').addEventListener('click', async () => {
  const roadId = document.getElementById('reportRoadSelect').value;
  const hours = document.getElementById('reportHours').value || 24;
  if (!roadId) return;
  try {
    const res = await authedFetch(`/prediction/report/${roadId}/download?hours=${hours}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Could not download report — train a model for this road first.');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic_prediction_report_road_${roadId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert(err.message);
  }
});

/* =========================================================
   INITIAL LOAD
   ========================================================= */
loadRoadsTable();
