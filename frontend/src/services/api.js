const API_URL = "https://society-maintenance-tracker-hok6.onrender.com";

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
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
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
      localStorage.removeItem("user");
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
  localStorage.removeItem("user");
}

// =========================
// GET NOTICES
// =========================
export async function getNotices() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found");
  }

  const response = await fetch(`${API_URL}/notices`, {
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
      localStorage.removeItem("user");
    }

    throw new Error(
      data.detail || "Failed to load notices"
    );
  }

  return data;
}

// =========================
// CREATE NOTICE - ADMIN
// =========================
export async function createNotice(
  title,
  content,
  isImportant,
  isPinned
) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found");
  }

  const response = await fetch(
    `${API_URL}/admin/notices`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
        is_important: isImportant,
        is_pinned: isPinned,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }

    throw new Error(
      data.detail || "Failed to create notice"
    );
  }

  return data;
}

// =========================
// UPDATE NOTICE - ADMIN
// =========================
export async function updateNotice(
  noticeId,
  title,
  content,
  isImportant,
  isPinned
) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found");
  }

  const response = await fetch(
    `${API_URL}/admin/notices/${noticeId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
        is_important: isImportant,
        is_pinned: isPinned,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }

    throw new Error(
      data.detail || "Failed to update notice"
    );
  }

  return data;
}

// =========================
// DELETE NOTICE - ADMIN
// =========================
export async function deleteNotice(noticeId) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found");
  }

  const response = await fetch(
    `${API_URL}/admin/notices/${noticeId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }

    throw new Error(
      data.detail || "Failed to delete notice"
    );
  }

  return data;
}