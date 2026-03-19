import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  LegalDocumentDefinition,
  getLegalDocument,
  LEGAL_DOCUMENT_ORDER
} from "../../constants/legalDocuments";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAppTranslation } from "../../i18n";
import { useAppNavigation, useCurrentOverlayRoute } from "../../store/navigationStore";
import { AppTheme, radius, shadows, spacing, useAppTheme } from "../../theme";

export function LegalDocumentScreen(): JSX.Element {
  const navigation = useAppNavigation();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { locale } = useAppTranslation();
  const isFrench = locale === "fr";
  const route = useCurrentOverlayRoute();
  const documentId =
    route?.name === "LegalDocument" ? route.params.documentId : LEGAL_DOCUMENT_ORDER[0];
  const document = getLegalDocument(documentId);
  const [expandedFaqItem, setExpandedFaqItem] = useState<string | null>(null);
  const faqQuestionCount =
    document.id === "faq"
      ? document.sections.reduce(
          (total, section) => total + (section.faqItems?.length ?? 0),
          0
        )
      : 0;

  useEffect(() => {
    setExpandedFaqItem(document.id === "faq" ? getFirstFaqItemKey(document) : null);
  }, [documentId, document]);

  const toggleFaqItem = (itemKey: string) => {
    setExpandedFaqItem((currentItem) => (currentItem === itemKey ? null : itemKey));
  };
  const copy = {
    back: isFrench ? "Retour" : "Back",
    helpCenter: isFrench ? "Centre d'aide" : "Help center",
    faqTitle: isFrench ? "Une FAQ plus simple a parcourir" : "An easier FAQ to browse",
    faqBody: isFrench
      ? "Ouvre une question pour afficher la reponse utile sans devoir lire tout le document d'un bloc."
      : "Open a question to show the useful answer without reading the whole document in one block.",
    keyThemes: isFrench ? "themes cles" : "key themes",
    quickAnswers: isFrench ? "reponses rapides" : "quick answers",
    questionSingular: isFrench ? "question" : "question",
    questionPlural: isFrench ? "questions" : "questions"
  };

  return (
    <Screen
      title={document.title}
      subtitle={document.subtitle}
      action={<PrimaryButton title={copy.back} onPress={navigation.goBack} variant="secondary" />}
    >
      {document.id === "faq" ? (
        <View style={styles.faqLayout}>
          <View style={styles.faqHeroCard}>
            <View pointerEvents="none" style={styles.faqHeroGlowOrange} />
            <View pointerEvents="none" style={styles.faqHeroGlowPurple} />
            <Text style={styles.faqEyebrow}>{copy.helpCenter}</Text>
            <Text style={styles.faqHeroTitle}>{copy.faqTitle}</Text>
            <Text style={styles.faqHeroDescription}>{copy.faqBody}</Text>
            <View style={styles.faqStatsRow}>
              <View style={styles.faqStatCard}>
                <Text style={styles.faqStatValue}>{document.sections.length}</Text>
                <Text style={styles.faqStatLabel}>{copy.keyThemes}</Text>
              </View>
              <View style={styles.faqStatCard}>
                <Text style={styles.faqStatValue}>{faqQuestionCount}</Text>
                <Text style={styles.faqStatLabel}>{copy.quickAnswers}</Text>
              </View>
            </View>
          </View>
          {document.sections.map((section, sectionIndex) => (
            <View key={section.title} style={styles.faqSectionCard}>
              <View style={styles.faqSectionHeader}>
                <View style={styles.faqSectionBadge}>
                  <Text style={styles.faqSectionBadgeText}>
                    {String(sectionIndex + 1).padStart(2, "0")}
                  </Text>
                </View>
                <View style={styles.faqSectionText}>
                  <Text style={styles.faqSectionTitle}>{section.title}</Text>
                  {section.summary ? (
                    <Text style={styles.faqSectionSummary}>{section.summary}</Text>
                  ) : null}
                  <Text style={styles.faqSectionMeta}>
                    {section.faqItems?.length ?? 0}{" "}
                    {section.faqItems?.length === 1
                      ? copy.questionSingular
                      : copy.questionPlural}
                  </Text>
                </View>
              </View>
              <View style={styles.faqQuestionList}>
                {section.faqItems?.map((item, itemIndex) => {
                  const itemKey = getFaqItemKey(sectionIndex, itemIndex);
                  const isExpanded = expandedFaqItem === itemKey;

                  return (
                    <View
                      key={item.question}
                      style={[
                        styles.faqQuestionCard,
                        isExpanded ? styles.faqQuestionCardExpanded : null
                      ]}
                    >
                      <Pressable
                        onPress={() => toggleFaqItem(itemKey)}
                        accessibilityRole="button"
                        accessibilityState={{ expanded: isExpanded }}
                        style={styles.faqQuestionButton}
                      >
                        <View style={styles.faqQuestionHeading}>
                          <View
                            style={[
                              styles.faqQuestionIndexPill,
                              isExpanded ? styles.faqQuestionIndexPillExpanded : null
                            ]}
                          >
                            <Text
                              style={[
                                styles.faqQuestionIndex,
                                isExpanded ? styles.faqQuestionIndexExpanded : null
                              ]}
                            >
                              {String(itemIndex + 1).padStart(2, "0")}
                            </Text>
                          </View>
                          <Text style={styles.faqQuestionText}>{item.question}</Text>
                        </View>
                        <View
                          style={[
                            styles.faqQuestionIndicator,
                            isExpanded ? styles.faqQuestionIndicatorExpanded : null
                          ]}
                        >
                          <Text
                            style={[
                              styles.faqQuestionIndicatorText,
                              isExpanded ? styles.faqQuestionIndicatorTextExpanded : null
                            ]}
                          >
                            {isExpanded ? "-" : "+"}
                          </Text>
                        </View>
                      </Pressable>
                      {isExpanded ? <Text style={styles.faqAnswer}>{item.answer}</Text> : null}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.card}>
          {document.sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.paragraphs?.map((paragraph) => (
                <Text key={paragraph} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
              {section.bullets?.map((bullet) => (
                <View key={bullet} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

function getFaqItemKey(sectionIndex: number, itemIndex: number): string {
  return `${sectionIndex}-${itemIndex}`;
}

function getFirstFaqItemKey(document: LegalDocumentDefinition): string | null {
  for (let sectionIndex = 0; sectionIndex < document.sections.length; sectionIndex += 1) {
    const section = document.sections[sectionIndex];
    if (section.faqItems?.length) {
      return getFaqItemKey(sectionIndex, 0);
    }
  }

  return null;
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    faqLayout: {
      gap: spacing.lg
    },
    faqHeroCard: {
      position: "relative",
      overflow: "hidden",
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: radius.lg,
      padding: spacing.xl,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      ...shadows.card
    },
    faqHeroGlowOrange: {
      position: "absolute",
      top: -48,
      right: -24,
      width: 148,
      height: 148,
      borderRadius: 999,
      backgroundColor: theme.colors.glowOrange
    },
    faqHeroGlowPurple: {
      position: "absolute",
      bottom: -72,
      left: -32,
      width: 164,
      height: 164,
      borderRadius: 999,
      backgroundColor: theme.colors.glowPurple
    },
    faqEyebrow: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: theme.colors.primary
    },
    faqHeroTitle: {
      maxWidth: 320,
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    faqHeroDescription: {
      maxWidth: 460,
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textSecondary
    },
    faqStatsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    faqStatCard: {
      minWidth: 140,
      flexGrow: 1,
      backgroundColor: theme.colors.surfaceContrast,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong
    },
    faqStatValue: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    faqStatLabel: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      color: theme.colors.textSecondary
    },
    faqSectionCard: {
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: radius.md,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...shadows.card
    },
    faqSectionHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md
    },
    faqSectionBadge: {
      width: 46,
      height: 46,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceContrast,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong
    },
    faqSectionBadgeText: {
      fontSize: 15,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    faqSectionText: {
      flex: 1,
      gap: 4
    },
    faqSectionTitle: {
      fontSize: 19,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    faqSectionSummary: {
      fontSize: 14,
      lineHeight: 21,
      color: theme.colors.textSecondary
    },
    faqSectionMeta: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.4,
      textTransform: "uppercase",
      color: theme.colors.primary
    },
    faqQuestionList: {
      gap: spacing.sm
    },
    faqQuestionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: radius.sm,
      padding: spacing.sm,
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    faqQuestionCardExpanded: {
      backgroundColor: theme.colors.surfaceContrast,
      borderColor: theme.colors.borderStrong
    },
    faqQuestionButton: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md
    },
    faqQuestionHeading: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm
    },
    faqQuestionIndexPill: {
      minWidth: 40,
      height: 30,
      paddingHorizontal: spacing.sm,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    faqQuestionIndexPillExpanded: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.warning
    },
    faqQuestionIndex: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.colors.textSecondary
    },
    faqQuestionIndexExpanded: {
      color: "#241602"
    },
    faqQuestionText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: theme.colors.textPrimary
    },
    faqQuestionIndicator: {
      width: 32,
      height: 32,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    faqQuestionIndicatorExpanded: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.warning
    },
    faqQuestionIndicatorText: {
      fontSize: 20,
      lineHeight: 20,
      fontWeight: "700",
      color: theme.colors.textSecondary
    },
    faqQuestionIndicatorTextExpanded: {
      color: "#241602"
    },
    faqAnswer: {
      paddingLeft: 52,
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.textSecondary
    },
    card: {
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: radius.md,
      padding: spacing.lg,
      gap: spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    section: {
      gap: spacing.sm
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    paragraph: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.textSecondary
    },
    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm
    },
    bulletDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      marginTop: 7,
      backgroundColor: theme.colors.primary
    },
    bulletText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.textSecondary
    }
  });
