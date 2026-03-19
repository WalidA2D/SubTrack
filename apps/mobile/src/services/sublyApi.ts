import {
  Subscription,
  SubscriptionInput,
  UpdateSettingsRequest,
  UserProfile
} from "@subly/shared";

import { apiRequest } from "./apiClient";

export type DashboardSummary = {
  monthlySpending: number;
  yearlyEstimate: number;
  subscriptionCount: number;
  upcomingPayments: Array<{
    subscriptionId: string;
    providerName: string;
    amount: number;
    dueDate: string;
  }>;
  insights: Array<{
    type: string;
    message: string;
    providerName?: string;
    count?: number;
  }>;
};

export type StatisticsOverview = {
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    amountMonthly: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
  }>;
  subscriptionCount: number;
  biggestSubscriptions: Array<{
    subscriptionId: string;
    providerName: string;
    amountMonthly: number;
  }>;
};

export type AccountDeletionRequestResponse = {
  deletionRequestedAt: string;
  deletionScheduledFor: string;
};

type DataResponse<T> = {
  data: T;
};

type ListResponse<T> = {
  data: T[];
  meta: {
    total: number;
  };
};

export const sublyApi = {
  async getProfile() {
    const response = await apiRequest<DataResponse<UserProfile>>("/settings/profile");
    return response.data;
  },

  async updateSettings(payload: UpdateSettingsRequest) {
    const response = await apiRequest<DataResponse<UserProfile>>("/settings", {
      method: "PATCH",
      body: JSON.stringify(payload)
    });

    return response.data;
  },

  async requestAccountDeletion() {
    const response = await apiRequest<DataResponse<AccountDeletionRequestResponse>>(
      "/settings/account-deletion",
      {
        method: "POST"
      }
    );

    return response.data;
  },

  async listSubscriptions() {
    const response = await apiRequest<ListResponse<Subscription>>("/subscriptions");
    return response.data;
  },

  async createSubscription(payload: SubscriptionInput) {
    const response = await apiRequest<DataResponse<Subscription>>("/subscriptions", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return response.data;
  },

  async updateSubscription(subscriptionId: string, payload: Partial<SubscriptionInput>) {
    await apiRequest<DataResponse<{ id: string; updatedAt: string }>>(
      `/subscriptions/${subscriptionId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload)
      }
    );
  },

  async archiveSubscription(subscriptionId: string) {
    await apiRequest<{ message: string }>(`/subscriptions/${subscriptionId}`, {
      method: "DELETE"
    });
  },

  async getDashboardSummary() {
    const response = await apiRequest<DataResponse<DashboardSummary>>("/dashboard/summary");
    return response.data;
  },

  async getStatisticsOverview() {
    const response = await apiRequest<DataResponse<StatisticsOverview>>("/statistics/overview");
    return response.data;
  }
};
