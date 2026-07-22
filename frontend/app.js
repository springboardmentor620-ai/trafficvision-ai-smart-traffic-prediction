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

if (role === 'admin' || role === 'operator') {
  document.getElementById('operatorPanel').style.display = 'block';
}
if (role === 'admin') {
  document.getElementById('adminPanel').style.display = 'block';
  loadUsers();
}

const LEVEL_COLOR = { low: 'var(--cyan)', medium: 'var(--amber)', high: 'var(--red)' };
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

async function loadLiveTraffic() {
  try {
    const res = await authedFetch('/traffic/live');
    const data = await res.json();
    const grid = document.getElementById('roadGrid');

    if (!data.length) {
      grid.innerHTML = '<div class="empty-state">No roads configured yet. Add one below to start monitoring.</div>';
      return;
    }

    grid.innerHTML = data.map(r => `
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
  } catch (e) {
    console.error(e);
  }
}

async function loadUsers() {
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

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const roadForm = document.getElementById('roadForm');
if (roadForm) {
  roadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('roadName').value.trim();
    const location = document.getElementById('roadLocation').value.trim();
    const lane_capacity = parseInt(document.getElementById('roadCapacity').value, 10);

    try {
      const res = await authedFetch('/traffic/roads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, lane_capacity }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Could not add road');
      }
      roadForm.reset();
      document.getElementById('roadCapacity').value = 100;
      loadLiveTraffic();
    } catch (err) {
      alert(err.message);
    }
  });
}

loadLiveTraffic();
setInterval(loadLiveTraffic, 5000);
