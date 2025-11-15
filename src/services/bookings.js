import { apiRequest } from "./apiClient";

export const bookingsAPI = {
    create: (payload) => apiRequest("/bookings", "POST", payload, true),

    list: () => apiRequest("/bookings", "GET", null, true),

    cancel: (bookingId) =>
        apiRequest(`/bookings/${bookingId}/cancel`, "POST", null, true),
};
