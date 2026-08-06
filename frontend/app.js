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
  'page-alerts': 'Alerts & Notifications',
  'page-analytics': 'Analytics Dashboard',
  'page-trends': 'Traffic Trends',
  'page-ai-insights': 'AI Insights',
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
  if (pageId === 'page-alerts') loadAlerts();
  if (pageId === 'page-analytics') loadAnalytics();
  if (pageId === 'page-trends') loadTrends();
  if (pageId === 'page-ai-insights') loadRecommendations();
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
  const accidentPanel = document.getElementById('accidentPanel');
  if (accidentPanel) accidentPanel.style.display = 'block';
  const emergencyPanel = document.getElementById('emergencyPanel');
  if (emergencyPanel) emergencyPanel.style.display = 'block';
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
  populateAccidentRoadSelect();
  populatePatternRoadSelect();
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
    tbody.innerHTML = users.map(u => {
      const isSelf = u.username === username;
      return `
      <tr data-user-row="${u.id}">
        <td class="mono">${escapeHtml(u.username)}${isSelf ? ' <span class="hint" style="display:inline;">(you)</span>' : ''}</td>
        <td>
          <select class="role-select" data-user-id="${u.id}" ${isSelf ? 'disabled title="You cannot change your own role"' : ''}>
            <option value="operator" ${u.role === 'operator' ? 'selected' : ''}>Traffic Operator</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Traffic Authority (Admin)</option>
            <option value="viewer" ${u.role === 'viewer' ? 'selected' : ''}>Public / Commuter</option>
          </select>
        </td>
        <td>
          <button class="icon-btn" data-toggle-active="${u.id}" data-active="${u.is_active ? '1' : '0'}">
            ${u.is_active ? 'Active — disable' : 'Disabled — enable'}
          </button>
        </td>
        <td>
          <button class="icon-btn danger" data-delete-user="${u.id}" ${isSelf ? 'disabled title="You cannot delete your own account"' : ''}>Delete</button>
        </td>
      </tr>
    `;
    }).join('');

    tbody.querySelectorAll('[data-user-id]').forEach(sel => {
      sel.addEventListener('change', async () => {
        const userId = sel.dataset.userId;
        const newRole = sel.value;
        sel.disabled = true;
        try {
          const res = await authedFetch(`/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Could not update role');
          }
        } catch (err) {
          alert(err.message);
          loadUsers(); // revert the dropdown to the real value
          return;
        }
        loadUsers();
      });
    });

    tbody.querySelectorAll('[data-toggle-active]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.toggleActive;
        const currentlyActive = btn.dataset.active === '1';
        btn.disabled = true;
        try {
          const res = await authedFetch(`/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !currentlyActive }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Could not update status');
          }
          loadUsers();
        } catch (err) {
          alert(err.message);
          btn.disabled = false;
        }
      });
    });

    tbody.querySelectorAll('[data-delete-user]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.deleteUser;
        const row = tbody.querySelector(`tr[data-user-row="${userId}"]`);
        const rowUsername = row ? row.querySelector('td').textContent.trim() : 'this user';
        if (!confirm(`Delete account "${rowUsername}"? This cannot be undone.`)) return;
        btn.disabled = true;
        try {
          const res = await authedFetch(`/users/${userId}`, { method: 'DELETE' });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Could not delete user');
          }
          loadUsers();
        } catch (err) {
          alert(err.message);
          btn.disabled = false;
        }
      });
    });
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
    const email = encodeURIComponent(document.getElementById('profileEmail').value.trim());
    try {
      const res = await authedFetch(`/users/me?email=${email}`, { method: 'PUT' });
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
    if (roads.length > 1) document.getElementById('destRoadSelect').value = roads[1].id;
  } catch (e) {
    console.error(e);
  }
}
populateRouteRoadSelects();

let routeMap = null;
let routeMapLayer = null; // L.layerGroup holding the current route polyline + markers

function renderRouteOnMap(data) {
  const mapDiv = document.getElementById('routeMap');
  if (typeof L === 'undefined') {
    mapDiv.innerHTML = `<div class="empty-state" style="padding:60px 20px;">
      Could not load the map library (Leaflet) from its CDN. Check your internet
      connection and reload the page.
    </div>`;
    return;
  }

  // The Route Analysis Module labels the first (index 0) route "Primary route".
  const primary = data.routes.find(r => r.label === 'Primary route') || data.routes[0];
  if (!primary || !primary.geometry || !primary.geometry.coordinates) return;

  // GeoJSON coordinates are [lon, lat]; Leaflet wants [lat, lon].
  const latlngs = primary.geometry.coordinates.map(([lon, lat]) => [lat, lon]);

  try {
    if (!routeMap) {
      routeMap = L.map('routeMap');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(routeMap);
    } else {
      routeMap.invalidateSize();
    }

    if (routeMapLayer) routeMapLayer.remove();
    routeMapLayer = L.layerGroup().addTo(routeMap);

    // Primary route line.
    L.polyline(latlngs, { color: '#38E1C6', weight: 5, opacity: 0.9 }).addTo(routeMapLayer);

    // Any alternates, shown dimmer/dashed for context.
    data.routes.forEach(r => {
      if (r === primary || !r.geometry || !r.geometry.coordinates) return;
      const alt = r.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      L.polyline(alt, { color: '#7C8CA0', weight: 3, opacity: 0.6, dashArray: '6 8' }).addTo(routeMapLayer);
    });

    // Origin / destination markers.
    L.circleMarker([data.origin.latitude, data.origin.longitude], {
      radius: 8, color: '#2ECC71', fillColor: '#2ECC71', fillOpacity: 0.9, weight: 2,
    }).bindPopup('Origin').addTo(routeMapLayer);
    L.circleMarker([data.destination.latitude, data.destination.longitude], {
      radius: 8, color: '#E63946', fillColor: '#E63946', fillOpacity: 0.9, weight: 2,
    }).bindPopup('Destination').addTo(routeMapLayer);

    routeMap.fitBounds(L.latLngBounds(latlngs), { padding: [30, 30] });
  } catch (e) {
    console.error('Route map render failed:', e);
    mapDiv.innerHTML = `<div class="empty-state" style="padding:60px 20px;">Map failed to load: ${e.message}</div>`;
  }
}

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

    // Leaflet needs the container visible (non-zero size) before init/fitBounds,
    // so render on the next frame after resultsBox becomes visible.
    requestAnimationFrame(() => renderRouteOnMap(data));
  } catch (err) {
    msg.textContent = err.message;
    msg.style.color = 'var(--red)';
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
  } catch (e) {
    console.error(e);
  }
}
populatePredictionRoadSelect();

(function initForecastDateTimeDefaults() {
  const dateInput = document.getElementById('forecastDate');
  const timeInput = document.getElementById('forecastTime');
  if (!dateInput || !timeInput) return;

  const toLocalISODate = (d) => {
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
  };

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  dateInput.value = toLocalISODate(tomorrow);
  dateInput.min = toLocalISODate(today);
  dateInput.max = toLocalISODate(maxDate);
  timeInput.value = '00:00';
})();

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
  if (!roadId) return;

  const dateStr = document.getElementById('forecastDate').value;
  const timeStr = document.getElementById('forecastTime').value || '00:00';
  if (!dateStr) {
    setPredictionMsg('Pick a date to forecast.', true);
    return;
  }

  const target = new Date(`${dateStr}T${timeStr}:00`);
  const now = new Date();
  if (target < now) {
    setPredictionMsg('Pick a date/time in the future.', true);
    return;
  }
  // Send as a naive ISO string (no trailing "Z") since the backend works in
  // UTC-naive timestamps throughout.
  const targetIso = `${dateStr}T${timeStr}:00`;

  setPredictionMsg('Generating forecast…');
  try {
    const res = await authedFetch(`/prediction/forecast_at/${roadId}?target=${encodeURIComponent(targetIso)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Forecast failed — train a model for this road first.');

    const isDaily = data.granularity === 'daily';
    setPredictionMsg(
      isDaily
        ? `This road's real historical data is daily-only, so the model predicts a daily total ` +
          `(${data.predicted_daily_total} vehicles) and splits it across the hour you picked using ` +
          `a typical urban rush-hour traffic curve — so the exact time you chose does shape the result.`
        : ''
    );

    // A single point in time has no separate "peak" vs "quietest" — hide
    // that summary block and just show the one forecast row.
    document.getElementById('predictionSummary').style.display = 'none';

    const table = document.getElementById('forecastTable');
    table.style.display = 'table';
    table.querySelector('thead tr th:first-child').textContent = 'Forecast time';
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = `
      <tr>
        <td class="mono">${data.forecast_time}</td>
        <td class="mono">${data.predicted_vehicle_count}</td>
        <td style="color:${LEVEL_COLOR[data.predicted_congestion_level]}">${data.predicted_congestion_level}</td>
      </tr>
    `;
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
    a.download = `traffic_prediction_report_road_${roadId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert(err.message);
  }
});

/* =========================================================
   ALERTS & NOTIFICATIONS
   ========================================================= */
async function populateAccidentRoadSelect() {
  try {
    const res = await authedFetch('/traffic/roads');
    const roads = await res.json();
    const select = document.getElementById('accidentRoadSelect');
    if (select) select.innerHTML = roads.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');
    const emergencySelect = document.getElementById('emergencyRoadSelect');
    if (emergencySelect) {
      emergencySelect.innerHTML = '<option value="">Citywide / general</option>'
        + roads.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');
    }
  } catch (e) {
    console.error(e);
  }
}
populateAccidentRoadSelect();

const ALERT_TYPE_LABEL = {
  congestion: 'Congestion', accident: 'Accident', route_delay: 'Route delay', emergency: 'Emergency',
};
const SEVERITY_COLOR = { low: 'var(--cyan)', medium: 'var(--amber)', high: 'var(--red)' };

function renderAlerts(alertsData) {
  const container = document.getElementById('alertsList');
  if (!container) return;
  if (!alertsData.length) {
    container.innerHTML = '<div class="empty-state">No alerts to show.</div>';
    return;
  }
  const canManage = role === 'admin' || role === 'operator';
  container.innerHTML = alertsData.map(a => `
    <div class="alert-card status-${a.status}" style="--sev-color:${SEVERITY_COLOR[a.severity] || 'var(--muted)'}">
      <div class="alert-main">
        <span class="alert-type-badge">${ALERT_TYPE_LABEL[a.alert_type] || a.alert_type}</span>
        <span class="alert-severity">${a.severity}</span>
        <p class="alert-message">${escapeHtml(a.message)}</p>
        <p class="alert-meta mono">${a.road_name ? escapeHtml(a.road_name) + ' · ' : ''}${timeAgo(a.created_at)} · ${a.status}</p>
      </div>
      ${canManage ? `
        <div class="alert-actions">
          ${a.status === 'active' ? `<button class="icon-btn" data-ack="${a.id}">Acknowledge</button>` : ''}
          ${a.status !== 'resolved' ? `<button class="icon-btn danger" data-resolve="${a.id}">Resolve</button>` : ''}
        </div>` : ''}
    </div>
  `).join('');

  container.querySelectorAll('[data-ack]').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      await authedFetch(`/alerts/${btn.dataset.ack}/acknowledge`, { method: 'PUT' });
      loadAlerts();
      refreshAlertBadge();
    });
  });
  container.querySelectorAll('[data-resolve]').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      await authedFetch(`/alerts/${btn.dataset.resolve}/resolve`, { method: 'PUT' });
      loadAlerts();
      refreshAlertBadge();
    });
  });
}

async function loadAlerts() {
  try {
    const filterSel = document.getElementById('alertFilter');
    const statusFilter = filterSel ? filterSel.value : '';
    const res = await authedFetch(`/alerts${statusFilter ? `?status=${statusFilter}` : ''}`);
    const data = await res.json();
    renderAlerts(data);
  } catch (e) {
    console.error(e);
  }
}

const alertFilterSel = document.getElementById('alertFilter');
if (alertFilterSel) alertFilterSel.addEventListener('change', loadAlerts);

async function refreshAlertBadge() {
  try {
    const res = await authedFetch('/alerts/active-count');
    const data = await res.json();
    const badge = document.getElementById('alertBadge');
    if (!badge) return;
    if (data.active_count > 0) {
      badge.textContent = data.active_count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  } catch (e) {
    console.error(e);
  }
}
refreshAlertBadge();
setInterval(refreshAlertBadge, 10000);

const accidentForm = document.getElementById('accidentForm');
if (accidentForm) {
  accidentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('accidentMsg');
    msg.textContent = '';
    const road_id = parseInt(document.getElementById('accidentRoadSelect').value, 10);
    const severity = document.getElementById('accidentSeverity').value;
    const description = document.getElementById('accidentDescription').value.trim();

    try {
      const res = await authedFetch('/alerts/accidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ road_id, severity, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not report accident');
      accidentForm.reset();
      document.getElementById('accidentSeverity').value = 'high';
      msg.textContent = 'Accident reported.';
      msg.style.color = 'var(--cyan)';
      loadAlerts();
      refreshAlertBadge();
    } catch (err) {
      msg.textContent = err.message;
      msg.style.color = 'var(--red)';
    }
  });
}

const emergencyForm = document.getElementById('emergencyForm');
if (emergencyForm) {
  emergencyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('emergencyMsg');
    msg.textContent = '';
    const roadValue = document.getElementById('emergencyRoadSelect').value;
    const road_id = roadValue ? parseInt(roadValue, 10) : null;
    const severity = document.getElementById('emergencySeverity').value;
    const message = document.getElementById('emergencyMessage').value.trim();

    try {
      const res = await authedFetch('/alerts/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ road_id, severity, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not broadcast emergency alert');
      emergencyForm.reset();
      document.getElementById('emergencySeverity').value = 'high';
      msg.textContent = 'Emergency alert broadcast.';
      msg.style.color = 'var(--cyan)';
      loadAlerts();
      refreshAlertBadge();
    } catch (err) {
      msg.textContent = err.message;
      msg.style.color = 'var(--red)';
    }
  });
}

/* =========================================================
   ANALYTICS DASHBOARD
   ========================================================= */
function heatCellColor(score) {
  if (score === null || score === undefined) return 'transparent';
  if (score < 0.75) return `color-mix(in srgb, var(--cyan) ${Math.round((1 - score / 0.75) * 40 + 15)}%, transparent)`;
  if (score < 1.4) return `color-mix(in srgb, var(--amber) 55%, transparent)`;
  return `color-mix(in srgb, var(--red) ${Math.round(50 + ((score - 1.4) / 0.6) * 40)}%, transparent)`;
}

function renderHeatmap(data) {
  const wrap = document.getElementById('heatmapWrap');
  if (!wrap) return;
  if (!data.rows.length) {
    wrap.innerHTML = '<div class="empty-state">No roads configured yet.</div>';
    return;
  }
  const cols = data.buckets;
  wrap.innerHTML = `
    <div class="heatmap-grid" style="grid-template-columns: 140px repeat(${cols}, 1fr);">
      <div class="heatmap-label"></div>
      ${Array.from({ length: cols }, (_, i) => `<div class="heatmap-colhead">${i === cols - 1 ? 'now' : `T-${cols - 1 - i}`}</div>`).join('')}
      ${data.rows.map(row => `
        <div class="heatmap-label mono">${escapeHtml(row.road_name)}</div>
        ${row.cells.map(c => `<div class="heatmap-cell" style="background:${heatCellColor(c)}" title="${c === null ? 'no data' : 'avg congestion score: ' + c}"></div>`).join('')}
      `).join('')}
    </div>
  `;
}

async function loadAnalytics() {
  try {
    const [summaryRes, heatmapRes, perfRes] = await Promise.all([
      authedFetch('/analytics/summary'),
      authedFetch('/analytics/heatmap'),
      authedFetch('/analytics/road-performance'),
    ]);
    const summary = await summaryRes.json();
    const heatmap = await heatmapRes.json();
    const perf = await perfRes.json();

    document.getElementById('anTotalRoads').textContent = summary.total_roads;
    document.getElementById('anTotalReadings').textContent = summary.total_readings_analyzed;
    document.getElementById('anAvgSpeed').textContent = summary.avg_speed_kmph;
    document.getElementById('anActiveAlerts').textContent = summary.active_alerts;

    renderHeatmap(heatmap);

    const tbody = document.querySelector('#performanceTable tbody');
    tbody.innerHTML = perf.map(r => `
      <tr>
        <td>${escapeHtml(r.road_name)}</td>
        <td class="mono">${r.avg_vehicle_count ?? '—'}</td>
        <td class="mono">${r.avg_speed_kmph ?? '—'}</td>
        <td class="mono">${r.pct_high_congestion != null ? r.pct_high_congestion + '%' : '—'}</td>
        <td class="mono">${r.performance_score ?? '—'}</td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

/* =========================================================
   TRAFFIC TRENDS  (trend analysis workflows)
   ========================================================= */
function renderBarChart(container, items, valueKey, tickKey, maxValue = 2) {
  if (!container) return;
  if (!items.length) {
    container.innerHTML = '<div class="empty-state">No data yet.</div>';
    return;
  }
  container.innerHTML = items.map(item => {
    const v = item[valueKey];
    const pct = v === null || v === undefined ? 0 : Math.max(2, Math.min(100, (v / maxValue) * 100));
    const color = v === null ? undefined : (v < 0.75 ? 'var(--cyan)' : v < 1.4 ? 'var(--amber)' : 'var(--red)');
    return `
      <div class="bar-col" title="${item[tickKey]}: ${v === null || v === undefined ? 'no data' : v}">
        <div class="bar ${v === null || v === undefined ? 'bar-empty' : ''}" style="height:${pct}%; ${color ? `background:${color};` : ''}"></div>
        <div class="bar-tick">${item[tickKey]}</div>
      </div>
    `;
  }).join('');
}

function renderTrendTable(rows) {
  const tbody = document.querySelector('#trendTable tbody');
  if (!tbody) return;
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Not enough historical data yet.</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${escapeHtml(r.road_name)}</td>
      <td class="mono">${r.prior_avg_score}</td>
      <td class="mono">${r.recent_avg_score}</td>
      <td class="mono">${r.pct_change > 0 ? '+' : ''}${r.pct_change}%</td>
      <td><span class="trend-badge ${r.direction}">${r.direction}</span></td>
    </tr>
  `).join('');
}

function formatTrendDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

async function loadTrends() {
  try {
    const res = await authedFetch('/analytics/trends');
    const data = await res.json();

    document.getElementById('trBusiestDay').textContent =
      data.busiest_day ? data.busiest_day.day.slice(0, 3) : '—';
    document.getElementById('trQuietestDay').textContent =
      data.quietest_day ? data.quietest_day.day.slice(0, 3) : '—';
    document.getElementById('trWorsening').textContent = data.road_trends.filter(r => r.direction === 'worsening').length;
    document.getElementById('trImproving').textContent = data.road_trends.filter(r => r.direction === 'improving').length;

    renderBarChart(
      document.getElementById('dailyTrendChart'),
      data.daily_pattern.map(p => ({ ...p, tick: p.day.slice(0, 3) })),
      'avg_congestion_score', 'tick'
    );
    renderBarChart(
      document.getElementById('monthlyTrendChart'),
      data.monthly_pattern.map(p => ({ ...p, tick: p.month })),
      'avg_congestion_score', 'tick'
    );

    const hintEl = document.getElementById('monthlyTrendHint');
    if (hintEl) {
      const start = formatTrendDate(data.data_start);
      const end = formatTrendDate(data.data_end);
      hintEl.textContent = start && end
        ? `Average congestion score (0 = low, 2 = high) across all roads, for each month (readings span ${start} – ${end}).`
        : 'Average congestion score (0 = low, 2 = high) across all roads, for each month.';
    }

    renderTrendTable(data.road_trends);
  } catch (e) {
    console.error(e);
  }
}

/* =========================================================
   AI INSIGHTS  (smart recommendations + pattern analysis)
   ========================================================= */
async function populatePatternRoadSelect() {
  try {
    const res = await authedFetch('/traffic/roads');
    const roads = await res.json();
    const select = document.getElementById('patternRoadSelect');
    if (select) select.innerHTML = roads.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');
  } catch (e) {
    console.error(e);
  }
}
populatePatternRoadSelect();

function renderRecommendations(list) {
  const container = document.getElementById('recommendationsList');
  if (!container) return;
  if (!list.length) {
    container.innerHTML = '<div class="empty-state">No roads with data yet.</div>';
    return;
  }
  container.innerHTML = list.map(r => `
    <div class="recommendation-card">
      <span class="priority-badge ${r.priority}">${r.priority}</span>
      <div class="rec-body">
        <p class="rec-road">${escapeHtml(r.road_name)}${r.location ? ` <span style="color:var(--muted); font-weight:400;">— ${escapeHtml(r.location)}</span>` : ''}</p>
        <p class="rec-text">${escapeHtml(r.recommendation)}</p>
      </div>
    </div>
  `).join('');
}

async function loadRecommendations() {
  try {
    const res = await authedFetch('/insights/recommendations');
    const data = await res.json();
    renderRecommendations(data);
  } catch (e) {
    console.error(e);
  }
}

const downloadRecommendationsReportBtn = document.getElementById('downloadRecommendationsReportBtn');
if (downloadRecommendationsReportBtn) {
  downloadRecommendationsReportBtn.addEventListener('click', async () => {
    try {
      const res = await authedFetch('/insights/recommendations/report');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Could not download recommendations report.');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'traffic_recommendations_report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  });
}

const analyzePatternBtn = document.getElementById('analyzePatternBtn');
if (analyzePatternBtn) {
  analyzePatternBtn.addEventListener('click', async () => {
    const roadId = document.getElementById('patternRoadSelect').value;
    if (!roadId) return;
    try {
      const res = await authedFetch(`/insights/patterns/${roadId}`);
      const data = await res.json();

      document.getElementById('patternResult').style.display = 'block';
      document.getElementById('ptBusiestDay').textContent =
        data.busiest_day ? data.busiest_day.day.slice(0, 3) : '—';
      document.getElementById('ptWeekday').textContent = data.weekday_avg_score ?? '—';
      document.getElementById('ptWeekend').textContent = data.weekend_avg_score ?? '—';
      document.getElementById('ptReadings').textContent = data.readings_analyzed;

      renderBarChart(
        document.getElementById('patternChart'),
        data.daily_pattern.map(p => ({ ...p, tick: p.day.slice(0, 3) })),
        'avg_congestion_score', 'tick'
      );
    } catch (err) {
      alert(err.message);
    }
  });
}

/* =========================================================
   INITIAL LOAD
   ========================================================= */
loadRoadsTable();
