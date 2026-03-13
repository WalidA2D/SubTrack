import { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../theme";

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  action?: ReactNode;
}>;

export function Screen({
  title,
  subtitle,
  action,
  children
}: ScreenProps): JSX.Element {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {action}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  headerText: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary
  }
});
