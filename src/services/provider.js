import { apiRequest } from "./apiClient";

export const providerAPI = {
    profile: () => apiRequest("/provider/profile", "GET", null, true),

    getServices: () => apiRequest("/provider/services", "GET", null, true),

    createService: (payload) =>
        apiRequest("/provider/services", "POST", payload, true),

    // Public list of providers — no auth
    getProviders: () => apiRequest("/provider", "GET", null, false),

    // Public provider services — no auth
    getProviderServices: (providerId) =>
        apiRequest(`/provider/${providerId}/services`, "GET", null, false),
};
