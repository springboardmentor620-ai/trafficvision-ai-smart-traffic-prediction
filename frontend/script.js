// ==========================================================
// TrafficVision AI - Shared frontend logic
// Handles: API calls, JWT session storage, auth guards
// ==========================================================

const API_BASE_URL = "http://127.0.0.1:5000/api";

/**
 * Generic API request helper.
 * Automatically attaches the JWT token (if present) as a Bearer header.
 */
async function apiRequest(path, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("tv_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong.");
    error.status = response.status;
    throw error;
  }
  return data;
}

/** Save JWT + user info after login/register */
function saveSession(token, user) {
  localStorage.setItem("tv_token", token);
  localStorage.setItem("tv_name", user.name);
  localStorage.setItem("tv_email", user.email);
  localStorage.setItem("tv_role", user.role);
}

/** Read current session from localStorage */
function getSession() {
  return {
    token: localStorage.getItem("tv_token"),
    name: localStorage.getItem("tv_name"),
    email: localStorage.getItem("tv_email"),
    role: localStorage.getItem("tv_role")
  };
}

/** Clear session (logout) */
function clearSession() {
  localStorage.removeItem("tv_token");
  localStorage.removeItem("tv_name");
  localStorage.removeItem("tv_email");
  localStorage.removeItem("tv_role");
}

/** Guard used on dashboard.html - redirect to login if not authenticated */
function requireAuth() {
  const session = getSession();
  if (!session.token) {
    window.location.href = "index.html";
  }
}

/** Used on login/register pages - if already logged in, skip straight to dashboard */
function redirectIfAuthenticated() {
  const session = getSession();
  if (session.token) {
    window.location.href = "dashboard.html";
  }
}

/** Show an error/info message on auth pages */
function showAlert(message) {
  const box = document.getElementById("alertBox");
  if (!box) return;
  box.textContent = message;
  box.classList.remove("hidden");
}