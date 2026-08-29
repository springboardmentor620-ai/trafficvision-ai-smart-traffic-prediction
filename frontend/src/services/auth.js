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

export async function loginStep1(email, password) {
  const response = await api.post("/auth/login-step1", { email, password });
  return response.data;
}

export async function loginVerifyOtp(email, code) {
  const response = await api.post("/auth/login-verify-otp", { email, code });
  return response.data;
}

export async function sendRegisterOtp(email) {
  const response = await api.post("/auth/send-register-otp", { email });
  return response.data;
}

export async function verifyRegisterOtp(userData) {
  const response = await api.post("/auth/verify-register-otp", userData);
  return response.data;
}

export async function forgotPassword(email) {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
}

export async function resetPassword(email, code, new_password) {
  const response = await api.post("/auth/reset-password", {
    email,
    code,
    new_password,
  });
  return response.data;
}

export async function googleAuth(googlePayload) {
  const response = await api.post("/auth/google-auth", googlePayload);
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