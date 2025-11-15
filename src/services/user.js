import { apiRequest } from "./apiClient";

export const userAPI = {
    profile: () => apiRequest("/user/profile", "GET", null, true),
};
