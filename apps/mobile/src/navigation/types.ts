import type { LegalDocumentId } from "../constants/legalDocuments";

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  MainTabs: undefined;
  AddSubscription: { subscriptionId?: string } | undefined;
  BubbleGallery: undefined;
  Subscriptions: undefined;
  SubscriptionPdfExport: undefined;
  SubscriptionDetails: { subscriptionId: string };
  StatisticsCalendar: undefined;
  NotificationCenter: undefined;
  Profile: undefined;
  Settings: undefined;
  LegalDocument: { documentId: LegalDocumentId };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Statistics: undefined;
};
