export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  MainTabs: undefined;
  AddSubscription: { subscriptionId?: string } | undefined;
  SubscriptionDetails: { subscriptionId: string };
  Profile: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Subscriptions: undefined;
  Statistics: undefined;
  Settings: undefined;
};
