import { apiRequest } from "./apiClient";

export const feedbackAPI = {
    submit: (payload) => apiRequest("/feedback", "POST", payload, true),

    providerFeedback: (providerId) =>
        apiRequest(`/feedback/provider/${providerId}`, "GET", null, true),
};
