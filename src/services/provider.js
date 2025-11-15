import { apiRequest } from "./apiClient";

export const providerAPI = {
    profile: () => apiRequest("/provider/profile", "GET", null, true),

    getServices: () => apiRequest("/provider/services", "GET", null, true),

    createService: (payload) =>
        apiRequest("/provider/services", "POST", payload, true),

    getProviders: () => apiRequest("/provider", "GET", null, false),

    // ⭐ NEW: Public endpoint for fetching services of any provider
    getProviderServices: (providerId) =>
        apiRequest(`/provider/${providerId}/services`, "GET", null, false),
};
