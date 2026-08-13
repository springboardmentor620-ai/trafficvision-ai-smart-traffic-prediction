import api from "./axios";

export async function authFetch(path, options = {}) {
  const url = /^https?:\/\//i.test(path)
    ? path
    : `${api.defaults.baseURL}${path.startsWith("/") ? path : `/${path}`}`;

  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});

  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    localStorage.removeItem("assigned_junction");

    if (window.location.pathname !== "/" && window.location.pathname !== "/register") {
      window.location.replace("/");
    }
  }

  return response;
}

export default authFetch;
