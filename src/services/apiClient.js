// src/services/apiClient.js

const BASE_URL = "https://queme.pythonanywhere.com";

export async function apiRequest(endpoint, method = "GET", body = null, auth = false, customToken = null) {
    const headers = { "Content-Type": "application/json" };

    // Add login token if required
    if (auth) {
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    // Add custom token (used for email verification)
    if (customToken) {
        headers["Authorization"] = `Bearer ${customToken}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    let response, data;

    try {
        response = await fetch(`${BASE_URL}${endpoint}`, options);
    } catch (error) {
        return { success: false, message: "Network error" };
    }

    // Try parsing JSON safely
    try {
        data = await response.json();
    } catch {
        data = {};
    }

    // Handle Unauthorized
    if (response.status === 401) {
        localStorage.removeItem("token");
        return { success: false, message: "Unauthorized" };
    }

    // Handle non-success (400/422/etc.)
    if (!response.ok) {
        return {
            success: false,
            message: data.message || data.error || "Request failed",
            errors: data.errors || null,
            status: response.status,
        };
    }

    // Always return success flag
    return {
        success: true,
        ...data,
    };
}
