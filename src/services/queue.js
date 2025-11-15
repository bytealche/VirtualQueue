import { apiRequest } from "./apiClient";

export const queueAPI = {
  // GET queue info for a provider
  getProviderQueue: (providerId, serviceId) =>
  apiRequest(`/queue?providerId=${providerId}&serviceId=${serviceId}`, "GET", null, true),

  // GET queue status by token
  getStatus: (token) =>
    apiRequest(`/queue/status?token=${token}`, "GET", null, true),

  // Provider calls next token
  callNext: (providerId) =>
    apiRequest(`/queue/call-next/${providerId}`, "POST", null, true),
};
