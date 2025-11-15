import { apiRequest } from "./apiClient";

export const analyticsAPI = {
    getAnalytics: (providerId, range = "week") =>
        apiRequest(`/analytics/provider/${providerId}?range=${range}`, "GET", null, true),
};
