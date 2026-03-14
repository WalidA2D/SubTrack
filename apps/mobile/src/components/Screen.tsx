import { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

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
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const isTablet = width >= 768;
  const horizontalPadding = isCompact ? spacing.md : isTablet ? spacing.xxxl : spacing.lg;

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={[styles.glow, styles.glowOrange]} />
        <View style={[styles.glow, styles.glowPurple]} />
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isTablet ? 820 : 560,
            alignSelf: "center"
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, isCompact ? styles.headerCompact : null]}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Subly</Text>
            <Text style={[styles.title, isCompact ? styles.titleCompact : null]}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden"
  },
  glow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999
  },
  glowOrange: {
    top: -70,
    right: -60,
    backgroundColor: colors.glowOrange
  },
  glowPurple: {
    top: 170,
    left: -110,
    backgroundColor: colors.glowPurple
  },
  content: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl + 70,
    gap: spacing.lg,
    width: "100%"
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  headerCompact: {
    flexDirection: "column",
    alignItems: "stretch"
  },
  headerText: {
    flex: 1,
    gap: spacing.xs
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.primary,
    textTransform: "uppercase"
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary
  },
  titleCompact: {
    fontSize: 28,
    lineHeight: 34
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary
  }
});
