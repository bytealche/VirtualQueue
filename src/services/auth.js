import { apiRequest } from "./apiClient";

export const authAPI = {
    // ============================
    // REGISTER (email verification)
    // ============================
    register: async (payload) => {
        // Backend returns { success, message }
        return await apiRequest("/auth/register", "POST", payload);
    },

    // ============================
    // LOGIN
    // ============================
    login: async (payload) => {
        const res = await apiRequest("/auth/login", "POST", payload);

        // If login failed, do NOT store anything
        if (!res.success) return res;

        // Store token manually (AppContext also stores user)
        localStorage.setItem("token", res.token);

        return res;
    },

    // ============================
    // GET AUTH USER
    // ============================
    me: () => apiRequest("/auth/me", "GET", null, true),

    // ============================
    // LOGOUT
    // ============================
    logout: () => {
        localStorage.removeItem("token");
    }
};
