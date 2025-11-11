const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function getUserProfile() {
  const res = await fetch(`${BASE_URL}/user/profile`);
  return res.json();
}

export async function getUserBookings() {
  const res = await fetch(`${BASE_URL}/bookings`);
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}
