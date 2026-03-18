import { StyleSheet, Text, View } from "react-native";

import {
  getLegalDocument,
  LEGAL_DOCUMENT_ORDER
} from "../../constants/legalDocuments";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAppNavigation, useCurrentOverlayRoute } from "../../store/navigationStore";
import { AppTheme, radius, spacing, useAppTheme } from "../../theme";

export function LegalDocumentScreen(): JSX.Element {
  const navigation = useAppNavigation();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const route = useCurrentOverlayRoute();
  const documentId =
    route?.name === "LegalDocument" ? route.params.documentId : LEGAL_DOCUMENT_ORDER[0];
  const document = getLegalDocument(documentId);

  return (
    <Screen
      title={document.title}
      subtitle={document.subtitle}
      action={<PrimaryButton title="Retour" onPress={navigation.goBack} variant="secondary" />}
    >
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
    </Screen>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
