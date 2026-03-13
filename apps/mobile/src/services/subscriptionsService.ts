import { SubscriptionInput } from "@subly/shared";

import { apiRequest } from "./apiClient";

export const subscriptionsService = {
  getAll() {
    return apiRequest<{ data: unknown[]; meta: { total: number } }>("/subscriptions");
  },

  create(payload: SubscriptionInput) {
    return apiRequest<{ data: unknown }>("/subscriptions", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  update(subscriptionId: string, payload: Partial<SubscriptionInput>) {
    return apiRequest<{ data: unknown }>(`/subscriptions/${subscriptionId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  remove(subscriptionId: string) {
    return apiRequest<{ message: string }>(`/subscriptions/${subscriptionId}`, {
      method: "DELETE"
    });
  }
};
