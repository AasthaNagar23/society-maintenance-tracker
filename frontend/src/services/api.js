const API_URL = "http://127.0.0.1:8000";


// =========================
// LOGIN
// =========================
export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  // IMPORTANT: Save token immediately
  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
  }

  return data;
}


// =========================
// REGISTER
// =========================
export async function registerUser(
  name,
  email,
  phone,
  password
) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      phone,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Registration failed"
    );
  }

  return data;
}


// =========================
// GET CURRENT USER
// =========================
export async function getCurrentUser() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found");
  }

  const response = await fetch(`${API_URL}/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // Remove bad/expired token
    if (response.status === 401) {
      localStorage.removeItem("access_token");
    }

    throw new Error(
      data.detail || "Failed to get user"
    );
  }

  return data;
}


// =========================
// GET RESIDENT DASHBOARD
// =========================
export async function getDashboard() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found");
  }

  const response = await fetch(`${API_URL}/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
    }

    throw new Error(
      data.detail || "Failed to load dashboard"
    );
  }

  return data;
}


// =========================
// LOGOUT
// =========================
export function logoutUser() {
  localStorage.removeItem("access_token");
}