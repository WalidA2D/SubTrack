import { PropsWithChildren, ReactNode } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions
} from "react-native";

import { AppTheme, spacing, useAppTheme } from "../theme";

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  action?: ReactNode;
  headerLayout?: "inline" | "stacked";
  headerTextStyle?: StyleProp<ViewStyle>;
  onScrollBeginDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}>;

export function Screen({
  title,
  subtitle,
  action,
  headerLayout = "inline",
  headerTextStyle,
  onScrollBeginDrag,
  children
}: ScreenProps): JSX.Element {
  const theme = useAppTheme();
  const styles = createStyles(theme);
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
        onScrollBeginDrag={onScrollBeginDrag}
      >
        {headerLayout === "stacked" ? (
          <View style={styles.headerStacked}>
            {action ? <View style={styles.headerActionTop}>{action}</View> : null}
            <View style={[styles.headerText, headerTextStyle]}>
              <Text style={[styles.title, isCompact ? styles.titleCompact : null]}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>
        ) : (
          <View style={[styles.header, isCompact ? styles.headerCompact : null]}>
            <View style={[styles.headerText, headerTextStyle]}>
              <Text style={[styles.title, isCompact ? styles.titleCompact : null]}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {action}
          </View>
        )}
        {children}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
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
      backgroundColor: theme.colors.glowOrange
    },
    glowPurple: {
      top: 170,
      left: -110,
      backgroundColor: theme.colors.glowPurple
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
    headerStacked: {
      gap: spacing.md
    },
    headerActionTop: {
      alignSelf: "flex-end"
    },
    headerText: {
      flex: 1,
      gap: spacing.xs
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    titleCompact: {
      fontSize: 28,
      lineHeight: 34
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textSecondary
    }
  });
