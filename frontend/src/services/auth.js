import api from "./api";

export async function login(email, password) {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post("/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
}

export async function register(userData) {
  const response = await api.post("/register", userData);

  return response.data;
}


export async function getCurrentUser() {
  const response = await api.get("/me");

  return response.data;
}