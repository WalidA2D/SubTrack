import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { SubscriptionStatus } from "@subly/shared";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAppTranslation } from "../../i18n";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AppTheme, radius, shadows, spacing, useAppTheme } from "../../theme";
import {
  buildSubscriptionDisplayEntries,
  sortSubscriptionDisplayEntries
} from "../../utils/subscriptionLinks";
import {
  formatBillingFrequency,
  formatCurrency,
  formatLongDate,
  formatStatus
} from "../../utils/format";

type StatusFilter = "all" | SubscriptionStatus;
type SortOption = "next_billing" | "price_desc" | "price_asc" | "provider";
type LinkFilter = "primary" | "included" | "all";
type DisplayEntry = ReturnType<typeof buildSubscriptionDisplayEntries>[number];

export function SubscriptionPdfExportScreen(): JSX.Element {
  const navigation = useAppNavigation();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { locale } = useAppTranslation();
  const isFrench = locale === "fr";
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const profile = useWorkspaceStore((state) => state.profile);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("next_billing");
  const [linkFilter, setLinkFilter] = useState<LinkFilter>("primary");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [includeNotes, setIncludeNotes] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const currency = profile?.currency ?? "EUR";
  const displayName = profile?.displayName?.trim() || profile?.email || "Subly User";
  const email = profile?.email ?? "support@subly.app";
  const copy = {
    title: isFrench ? "Export PDF" : "PDF export",
    subtitle: isFrench
      ? "Choisis les abonnements a inclure, puis genere un rapport propre et professionnel."
      : "Choose which subscriptions to include, then generate a clean professional report.",
    back: isFrench ? "Retour" : "Back",
    introTitle: isFrench ? "Rapport Premium" : "Premium report",
    introBody: isFrench
      ? "Le document reprend les abonnements selectionnes avec un entete clair, un resume et un tableau detaille proche d'une facture."
      : "The document includes selected subscriptions with a clear header, a summary and a detailed table close to an invoice.",
    searchLabel: isFrench ? "Recherche" : "Search",
    searchPlaceholder: isFrench
      ? "Netflix, Spotify, banque, productivite..."
      : "Netflix, Spotify, bank, productivity...",
    linkLabel: isFrench ? "Type d'abonnements" : "Subscription type",
    statusLabel: isFrench ? "Statut" : "Status",
    sortLabel: isFrench ? "Tri du rapport" : "Report sorting",
    categoryLabel: isFrench ? "Categorie" : "Category",
    includeNotesLabel: isFrench ? "Inclure les notes" : "Include notes",
    includeNotesBody: isFrench
      ? "Ajoute les remarques de chaque abonnement dans le PDF."
      : "Add each subscription notes inside the PDF.",
    previewTitle: isFrench ? "Apercu avant export" : "Preview before export",
    selectedCount: isFrench ? "Selection" : "Selection",
    monthlyTotal: isFrench ? "Total mensuel" : "Monthly total",
    yearlyTotal: isFrench ? "Total annuel" : "Yearly total",
    generate: isFrench ? "Generer le PDF" : "Generate PDF",
    generating: isFrench ? "Generation..." : "Generating...",
    shareDialog: isFrench ? "Partager le rapport PDF" : "Share PDF report",
    exportFailed: isFrench ? "Export impossible" : "Export failed",
    nothingTitle: isFrench ? "Aucun abonnement selectionne" : "No subscription selected",
    nothingBody: isFrench
      ? "Ajuste les filtres pour exporter au moins un abonnement."
      : "Adjust filters to export at least one subscription.",
    generatedTitle: isFrench ? "PDF genere" : "PDF generated",
    generatedBody: isFrench
      ? "Le PDF a ete genere, mais le partage n'est pas disponible sur cet appareil :"
      : "The PDF was generated, but sharing is not available on this device:",
    retry: isFrench ? "Merci de reessayer." : "Please try again.",
    primary: isFrench ? "Principaux" : "Primary",
    included: isFrench ? "Inclus" : "Included",
    all: isFrench ? "Tous" : "All",
    active: isFrench ? "Actifs" : "Active",
    trial: isFrench ? "Essais" : "Trials",
    cancelled: isFrench ? "Annules" : "Cancelled",
    soonest: isFrench ? "Prochaine echeance" : "Next due date",
    highest: isFrench ? "Prix decroissant" : "Highest price",
    lowest: isFrench ? "Prix croissant" : "Lowest price",
    provider: isFrench ? "Service A-Z" : "Service A-Z",
    allCategories: isFrench ? "Toutes" : "All",
    reportTitle: isFrench ? "Rapport des abonnements" : "Subscription report",
    reportSubtitle: isFrench
      ? "Synthese exportee depuis Subly Premium"
      : "Summary exported from Subly Premium",
    reportFor: isFrench ? "Client" : "Client",
    reportDate: isFrench ? "Date" : "Date",
    reportCurrency: isFrench ? "Devise" : "Currency",
    reportFilters: isFrench ? "Filtres appliques" : "Applied filters",
    reportTableService: isFrench ? "Service" : "Service",
    reportTableCategory: isFrench ? "Categorie" : "Category",
    reportTableStatus: isFrench ? "Statut" : "Status",
    reportTableBilling: isFrench ? "Facturation" : "Billing",
    reportTableNext: isFrench ? "Prochaine echeance" : "Next due",
    reportTableMonthly: isFrench ? "Mensuel" : "Monthly",
    reportTableYearly: isFrench ? "Annuel" : "Yearly",
    reportNotes: isFrench ? "Notes" : "Notes",
    reportFooter: isFrench
      ? "Document genere automatiquement par Subly."
      : "Document generated automatically by Subly.",
    primaryRelation: isFrench ? "Abonnement principal" : "Primary subscription",
    linkedRelation: (parents: string) =>
      isFrench ? `Lie a ${parents}` : `Linked to ${parents}`,
    includedRelation: (parents: string) =>
      isFrench ? `Inclus via ${parents}` : `Included via ${parents}`
  };

  const linkOptions = [
    { id: "primary" as const, label: copy.primary },
    { id: "included" as const, label: copy.included },
    { id: "all" as const, label: copy.all }
  ];
  const statusOptions = [
    { id: "all" as const, label: copy.all },
    { id: "active" as const, label: copy.active },
    { id: "trial" as const, label: copy.trial },
    { id: "cancelled" as const, label: copy.cancelled }
  ];
  const sortOptions = [
    { id: "next_billing" as const, label: copy.soonest },
    { id: "price_desc" as const, label: copy.highest },
    { id: "price_asc" as const, label: copy.lowest },
    { id: "provider" as const, label: copy.provider }
  ];

  const subscriptionEntries = useMemo(
    () => sortSubscriptionDisplayEntries(buildSubscriptionDisplayEntries(subscriptions)),
    [subscriptions]
  );
  const categoryOptions = useMemo(() => {
    const names = [...new Set(subscriptions.map((subscription) => subscription.categoryName))];
    return ["all", ...names.sort((left, right) => left.localeCompare(right, "fr"))];
  }, [subscriptions]);
  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    const nextEntries = subscriptionEntries.filter((entry) => {
      const { subscription, linkedParentProviderNames } = entry;
      const hasLinkedParent = hasParentLink(entry);

      if (linkFilter === "primary" && hasLinkedParent) {
        return false;
      }

      if (linkFilter === "included" && !hasLinkedParent) {
        return false;
      }

      if (statusFilter !== "all" && subscription.status !== statusFilter) {
        return false;
      }

      if (categoryFilter !== "all" && subscription.categoryName !== categoryFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [subscription.providerName, subscription.categoryName, ...(linkedParentProviderNames ?? [])]
        .some((value) => value.toLowerCase().includes(query));
    });

    return [...nextEntries].sort((left, right) => {
      if (sortOption === "price_desc") {
        return right.subscription.priceMonthly - left.subscription.priceMonthly;
      }

      if (sortOption === "price_asc") {
        return left.subscription.priceMonthly - right.subscription.priceMonthly;
      }

      if (sortOption === "provider") {
        return left.subscription.providerName.localeCompare(right.subscription.providerName, "fr", {
          sensitivity: "base"
        });
      }

      return (
        new Date(left.subscription.nextBillingDate).getTime() -
        new Date(right.subscription.nextBillingDate).getTime()
      );
    });
  }, [categoryFilter, linkFilter, search, sortOption, statusFilter, subscriptionEntries]);

  const monthlyTotal = filteredEntries.reduce(
    (sum, entry) => sum + (entry.isIncludedLink ? 0 : entry.subscription.priceMonthly),
    0
  );
  const yearlyTotal = filteredEntries.reduce(
    (sum, entry) => sum + (entry.isIncludedLink ? 0 : entry.subscription.priceYearly),
    0
  );

  const handleExport = async () => {
    if (filteredEntries.length === 0) {
      Alert.alert(copy.nothingTitle, copy.nothingBody);
      return;
    }

    try {
      setIsExporting(true);

      const html = buildSubscriptionReportHtml({
        title: copy.reportTitle,
        subtitle: copy.reportSubtitle,
        generatedAtLabel: copy.reportDate,
        generatedAtValue: formatLongDate(new Date().toISOString()),
        clientLabel: copy.reportFor,
        clientValue: displayName,
        email,
        currencyLabel: copy.reportCurrency,
        currency,
        filtersLabel: copy.reportFilters,
        filtersValue: buildFilterSummary({
          search,
          statusFilter,
          sortOption,
          linkFilter,
          categoryFilter,
          isFrench
        }),
        tableLabels: {
          service: copy.reportTableService,
          category: copy.reportTableCategory,
          status: copy.reportTableStatus,
          billing: copy.reportTableBilling,
          nextBilling: copy.reportTableNext,
          monthly: copy.reportTableMonthly,
          yearly: copy.reportTableYearly,
          notes: copy.reportNotes
        },
        footer: copy.reportFooter,
        entries: filteredEntries,
        includeNotes,
        monthlyTotal,
        yearlyTotal,
        relationFormatter: (entry) => getRelationLabel(entry, copy),
        totalSubscriptionsLabel: copy.selectedCount,
        totalMonthlyLabel: copy.monthlyTotal,
        totalYearlyLabel: copy.yearlyTotal
      });

      const result = await Print.printToFileAsync({
        html,
        base64: false
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          mimeType: "application/pdf",
          UTI: ".pdf",
          dialogTitle: copy.shareDialog
        });
        return;
      }

      Alert.alert(copy.generatedTitle, `${copy.generatedBody}\n${result.uri}`);
    } catch (error) {
      Alert.alert(
        copy.exportFailed,
        error instanceof Error ? error.message : copy.retry
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Screen
      title={copy.title}
      subtitle={copy.subtitle}
      action={<PrimaryButton title={copy.back} onPress={navigation.goBack} variant="secondary" />}
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>{copy.introTitle}</Text>
        <Text style={styles.heroBody}>{copy.introBody}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{copy.searchLabel}</Text>
        <TextInput
          style={styles.input}
          value={search}
          onChangeText={setSearch}
          placeholder={copy.searchPlaceholder}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{copy.linkLabel}</Text>
        <View style={styles.chipWrap}>
          {linkOptions.map((option) => (
            <FilterChip
              key={option.id}
              label={option.label}
              active={linkFilter === option.id}
              onPress={() => setLinkFilter(option.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{copy.statusLabel}</Text>
        <View style={styles.chipWrap}>
          {statusOptions.map((option) => (
            <FilterChip
              key={option.id}
              label={option.label}
              active={statusFilter === option.id}
              onPress={() => setStatusFilter(option.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{copy.sortLabel}</Text>
        <View style={styles.chipWrap}>
          {sortOptions.map((option) => (
            <FilterChip
              key={option.id}
              label={option.label}
              active={sortOption === option.id}
              onPress={() => setSortOption(option.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{copy.categoryLabel}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.inlineRow}>
            {categoryOptions.map((option) => (
              <FilterChip
                key={option}
                label={option === "all" ? copy.allCategories : option}
                active={categoryFilter === option}
                onPress={() => setCategoryFilter(option)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.sectionTitle}>{copy.includeNotesLabel}</Text>
            <Text style={styles.helper}>{copy.includeNotesBody}</Text>
          </View>
          <Switch
            value={includeNotes}
            onValueChange={setIncludeNotes}
            trackColor={{ true: theme.colors.secondary, false: theme.colors.surfaceContrast }}
            thumbColor={includeNotes ? theme.colors.primary : theme.colors.white}
          />
        </View>
      </View>

      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>{copy.previewTitle}</Text>
        <View style={styles.previewGrid}>
          <MetricCard label={copy.selectedCount} value={String(filteredEntries.length)} />
          <MetricCard label={copy.monthlyTotal} value={formatCurrency(monthlyTotal, currency)} />
          <MetricCard label={copy.yearlyTotal} value={formatCurrency(yearlyTotal, currency)} />
        </View>
      </View>

      <PrimaryButton
        title={isExporting ? copy.generating : copy.generate}
        onPress={() => void handleExport()}
        disabled={isExporting || filteredEntries.length === 0}
      />
    </Screen>
  );
}

function FilterChip({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}): JSX.Element {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active ? styles.filterChipActive : null]}
    >
      <Text style={[styles.filterChipLabel, active ? styles.filterChipLabelActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

function MetricCard({ label, value }: { label: string; value: string }): JSX.Element {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function buildFilterSummary({
  search,
  statusFilter,
  sortOption,
  linkFilter,
  categoryFilter,
  isFrench
}: {
  search: string;
  statusFilter: StatusFilter;
  sortOption: SortOption;
  linkFilter: LinkFilter;
  categoryFilter: string;
  isFrench: boolean;
}) {
  const parts: string[] = [];

  if (search.trim()) {
    parts.push(isFrench ? `Recherche: ${search.trim()}` : `Search: ${search.trim()}`);
  }

  if (statusFilter !== "all") {
    const label =
      statusFilter === "active"
        ? isFrench ? "Actifs" : "Active"
        : statusFilter === "trial"
          ? isFrench ? "Essais" : "Trials"
          : isFrench ? "Annules" : "Cancelled";
    parts.push(isFrench ? `Statut: ${label}` : `Status: ${label}`);
  }

  if (linkFilter !== "all") {
    const label =
      linkFilter === "primary"
        ? isFrench ? "Principaux" : "Primary"
        : isFrench ? "Inclus" : "Included";
    parts.push(isFrench ? `Type: ${label}` : `Type: ${label}`);
  }

  if (categoryFilter !== "all") {
    parts.push(isFrench ? `Categorie: ${categoryFilter}` : `Category: ${categoryFilter}`);
  }

  const sortLabel =
    sortOption === "price_desc"
      ? isFrench ? "Prix decroissant" : "Highest price"
      : sortOption === "price_asc"
        ? isFrench ? "Prix croissant" : "Lowest price"
        : sortOption === "provider"
          ? "A-Z"
          : isFrench ? "Prochaine echeance" : "Next due date";

  parts.push(isFrench ? `Tri: ${sortLabel}` : `Sort: ${sortLabel}`);

  return parts.join(" • ");
}

function getRelationLabel(
  entry: DisplayEntry,
  copy: {
    primaryRelation: string;
    linkedRelation: (parents: string) => string;
    includedRelation: (parents: string) => string;
  }
) {
  const parents = entry.linkedParentProviderNames?.join(", ") ?? "";

  if (entry.isIncludedLink) {
    return copy.includedRelation(parents || "-");
  }

  if (parents) {
    return copy.linkedRelation(parents);
  }

  return copy.primaryRelation;
}

function buildSubscriptionReportHtml({
  title,
  subtitle,
  generatedAtLabel,
  generatedAtValue,
  clientLabel,
  clientValue,
  email,
  currencyLabel,
  currency,
  filtersLabel,
  filtersValue,
  tableLabels,
  footer,
  entries,
  includeNotes,
  monthlyTotal,
  yearlyTotal,
  relationFormatter,
  totalSubscriptionsLabel,
  totalMonthlyLabel,
  totalYearlyLabel
}: {
  title: string;
  subtitle: string;
  generatedAtLabel: string;
  generatedAtValue: string;
  clientLabel: string;
  clientValue: string;
  email: string;
  currencyLabel: string;
  currency: string;
  filtersLabel: string;
  filtersValue: string;
  tableLabels: {
    service: string;
    category: string;
    status: string;
    billing: string;
    nextBilling: string;
    monthly: string;
    yearly: string;
    notes: string;
  };
  footer: string;
  entries: DisplayEntry[];
  includeNotes: boolean;
  monthlyTotal: number;
  yearlyTotal: number;
  relationFormatter: (entry: DisplayEntry) => string;
  totalSubscriptionsLabel: string;
  totalMonthlyLabel: string;
  totalYearlyLabel: string;
}) {
  const rows = entries.map((entry) => {
    const relation = relationFormatter(entry);
    const notes = includeNotes && entry.subscription.notes
      ? `<div class="notes"><strong>${escapeHtml(tableLabels.notes)}:</strong> ${escapeHtml(entry.subscription.notes)}</div>`
      : "";

    return `
      <tr>
        <td>
          <div class="service">${escapeHtml(entry.subscription.providerName)}</div>
          <div class="relation">${escapeHtml(relation)}</div>
          ${notes}
        </td>
        <td>${escapeHtml(entry.subscription.categoryName)}</td>
        <td>${escapeHtml(formatStatus(entry.subscription.status))}</td>
        <td>${escapeHtml(formatBillingFrequency(entry.subscription.billingFrequency))}</td>
        <td>${escapeHtml(formatLongDate(entry.subscription.nextBillingDate))}</td>
        <td>${escapeHtml(formatCurrency(entry.subscription.priceMonthly, currency))}</td>
        <td>${escapeHtml(formatCurrency(entry.subscription.priceYearly, currency))}</td>
      </tr>
    `;
  }).join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 16mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            background: #ffffff;
          }
          .page {
            display: flex;
            flex-direction: column;
            gap: 18px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid #f3f4f6;
          }
          .brand {
            flex: 1;
          }
          .eyebrow {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            color: #d97706;
          }
          .title {
            margin: 6px 0 4px;
            font-size: 28px;
            font-weight: 800;
            color: #111827;
          }
          .subtitle {
            font-size: 13px;
            line-height: 1.6;
            color: #6b7280;
          }
          .meta {
            min-width: 220px;
            padding: 16px;
            border-radius: 16px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
          }
          .meta-line {
            margin: 0 0 8px;
            font-size: 12px;
            line-height: 1.6;
            color: #374151;
          }
          .meta-line strong {
            color: #111827;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          .summary-card {
            padding: 14px;
            border-radius: 16px;
            border: 1px solid #e5e7eb;
            background: #fcfcfd;
          }
          .summary-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #6b7280;
          }
          .summary-value {
            margin-top: 8px;
            font-size: 22px;
            font-weight: 800;
            color: #111827;
          }
          .filters {
            padding: 14px 16px;
            border-radius: 16px;
            background: #fff7ed;
            border: 1px solid #fed7aa;
          }
          .filters strong {
            color: #9a3412;
          }
          .filters-text {
            margin-top: 4px;
            font-size: 12px;
            line-height: 1.7;
            color: #7c2d12;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead th {
            padding: 10px 12px;
            font-size: 11px;
            text-align: left;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #6b7280;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
          }
          tbody td {
            padding: 12px;
            vertical-align: top;
            border-bottom: 1px solid #f3f4f6;
            font-size: 12px;
            color: #111827;
          }
          tbody tr:nth-child(even) {
            background: #fcfcfd;
          }
          .service {
            font-size: 13px;
            font-weight: 700;
            color: #111827;
          }
          .relation {
            margin-top: 3px;
            font-size: 11px;
            color: #6b7280;
          }
          .notes {
            margin-top: 8px;
            padding: 8px 10px;
            border-radius: 10px;
            background: #f9fafb;
            color: #374151;
            font-size: 11px;
            line-height: 1.6;
          }
          tfoot td {
            padding: 12px;
            font-size: 12px;
            font-weight: 700;
            border-top: 2px solid #d1d5db;
            color: #111827;
            background: #f9fafb;
          }
          .footer {
            padding-top: 8px;
            font-size: 11px;
            color: #6b7280;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="brand">
              <div class="eyebrow">Subly Premium</div>
              <div class="title">${escapeHtml(title)}</div>
              <div class="subtitle">${escapeHtml(subtitle)}</div>
            </div>
            <div class="meta">
              <p class="meta-line"><strong>${escapeHtml(clientLabel)}:</strong> ${escapeHtml(clientValue)}</p>
              <p class="meta-line"><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p class="meta-line"><strong>${escapeHtml(generatedAtLabel)}:</strong> ${escapeHtml(generatedAtValue)}</p>
              <p class="meta-line"><strong>${escapeHtml(currencyLabel)}:</strong> ${escapeHtml(currency)}</p>
            </div>
          </div>

          <div class="summary">
            <div class="summary-card">
              <div class="summary-label">${escapeHtml(totalSubscriptionsLabel)}</div>
              <div class="summary-value">${entries.length}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">${escapeHtml(totalMonthlyLabel)}</div>
              <div class="summary-value">${escapeHtml(formatCurrency(monthlyTotal, currency))}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">${escapeHtml(totalYearlyLabel)}</div>
              <div class="summary-value">${escapeHtml(formatCurrency(yearlyTotal, currency))}</div>
            </div>
          </div>

          <div class="filters">
            <strong>${escapeHtml(filtersLabel)}</strong>
            <div class="filters-text">${escapeHtml(filtersValue || "-")}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>${escapeHtml(tableLabels.service)}</th>
                <th>${escapeHtml(tableLabels.category)}</th>
                <th>${escapeHtml(tableLabels.status)}</th>
                <th>${escapeHtml(tableLabels.billing)}</th>
                <th>${escapeHtml(tableLabels.nextBilling)}</th>
                <th>${escapeHtml(tableLabels.monthly)}</th>
                <th>${escapeHtml(tableLabels.yearly)}</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">${escapeHtml(totalMonthlyLabel)} / ${escapeHtml(totalYearlyLabel)}</td>
                <td>${escapeHtml(formatCurrency(monthlyTotal, currency))}</td>
                <td>${escapeHtml(formatCurrency(yearlyTotal, currency))}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">${escapeHtml(footer)}</div>
        </div>
      </body>
    </html>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hasParentLink(entry: Pick<DisplayEntry, "isIncludedLink" | "linkedParentSubscriptionIds">) {
  return entry.isIncludedLink || (entry.linkedParentSubscriptionIds?.length ?? 0) > 0;
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    heroCard: {
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: radius.md,
      padding: spacing.lg,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      ...shadows.card
    },
    heroTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    heroBody: {
      fontSize: 14,
      lineHeight: 21,
      color: theme.colors.textSecondary
    },
    card: {
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: radius.md,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    input: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      fontSize: 15,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface
    },
    chipWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    inlineRow: {
      flexDirection: "row",
      gap: spacing.sm,
      paddingRight: spacing.md
    },
    filterChip: {
      minHeight: 38,
      paddingHorizontal: spacing.md,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    filterChipActive: {
      backgroundColor: theme.colors.surfaceContrast,
      borderColor: theme.colors.primary
    },
    filterChipLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.textSecondary
    },
    filterChipLabelActive: {
      color: theme.colors.primary
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md
    },
    switchText: {
      flex: 1,
      gap: spacing.xs
    },
    helper: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.colors.textSecondary
    },
    previewCard: {
      borderRadius: radius.md,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.primaryStrong,
      backgroundColor: theme.colors.surfaceContrast
    },
    previewTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    previewGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    metricCard: {
      flexGrow: 1,
      minWidth: 120,
      padding: spacing.md,
      borderRadius: radius.sm,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    metricLabel: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      color: theme.colors.textTertiary
    },
    metricValue: {
      marginTop: spacing.xs,
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.textPrimary
    }
  });
