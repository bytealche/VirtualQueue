import { apiRequest } from "./apiClient";

export const authAPI = {
    register: (payload) => apiRequest("/auth/register", "POST", payload),
    login: async (payload) => {
        const res = await apiRequest("/auth/login", "POST", payload);
        localStorage.setItem("token", res.token);
        return res;
    },
    me: () => apiRequest("/auth/me", "GET", null, true),
    logout: () => localStorage.removeItem("token"),
};
