// src/api/apiClient.js

const BASE_URL = "https://queme.pythonanywhere.com";

export async function apiRequest(endpoint, method = "GET", body = null, auth = false) {
    const headers = { "Content-Type": "application/json" };

    if (auth) {
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, options);

    // Auto-logout on unauthorized
    if (res.status === 401) {
        localStorage.removeItem("token");
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message || data.error || "Request failed");
    }

    return data;
}
