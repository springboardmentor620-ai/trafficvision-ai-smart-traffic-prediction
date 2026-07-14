const API_URL = "http://127.0.0.1:8000";

export async function loginUser(data: {
  username: string;
  password: string;
}) {
  const formData = new URLSearchParams();

  formData.append("username", data.username);
  formData.append("password", data.password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  return response.json();
}

export async function registerUser(data: {
  full_name: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}