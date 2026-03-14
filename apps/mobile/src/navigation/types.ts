export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  MainTabs: undefined;
  AddSubscription: { subscriptionId?: string } | undefined;
  Subscriptions: undefined;
  SubscriptionDetails: { subscriptionId: string };
  Profile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Statistics: undefined;
};
