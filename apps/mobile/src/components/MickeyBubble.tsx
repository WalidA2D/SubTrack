import { StyleSheet, View } from "react-native";
import { type SubscriptionLogoMode } from "@subly/shared";

import { AppTheme, shadows, spacing, useAppTheme } from "../theme";
import { ServiceLogo } from "./ServiceLogo";

type MickeyBubbleProps = {
  providerName: string;
  size: number;
  coreScale?: number;
  logoScale?: number;
  logoMode?: SubscriptionLogoMode;
};

export function MickeyBubble({
  providerName,
  size,
  coreScale = 0.36,
  logoScale = 0.9,
  logoMode = "option"
}: MickeyBubbleProps): JSX.Element {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const earSize = Math.round(size * 0.33);
  const headSize = Math.round(size * 0.64);
  const headLeft = Math.round((size - headSize) / 2);
  const headTop = Math.round(size * 0.22);
  const coreSize = Math.round(size * coreScale);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View
        style={[
          styles.ear,
          styles.earLeft,
          {
            width: earSize,
            height: earSize,
            borderRadius: Math.round(earSize / 2),
            top: Math.round(size * 0.03),
            left: Math.round(size * 0.08)
          }
        ]}
      >
        <View
          style={[
            styles.earHighlight,
            {
              width: Math.round(earSize * 0.54),
              height: Math.round(earSize * 0.24),
              borderRadius: Math.round(earSize * 0.12)
            }
          ]}
        />
      </View>

      <View
        style={[
          styles.ear,
          styles.earRight,
          {
            width: earSize,
            height: earSize,
            borderRadius: Math.round(earSize / 2),
            top: Math.round(size * 0.03),
            right: Math.round(size * 0.08)
          }
        ]}
      >
        <View
          style={[
            styles.earHighlight,
            {
              width: Math.round(earSize * 0.54),
              height: Math.round(earSize * 0.24),
              borderRadius: Math.round(earSize * 0.12)
            }
          ]}
        />
      </View>

      <View
        style={[
          styles.head,
          {
            width: headSize,
            height: headSize,
            borderRadius: Math.round(headSize / 2),
            top: headTop,
            left: headLeft
          }
        ]}
      >
        <View
          style={[
            styles.headHighlight,
            {
              width: Math.round(headSize * 0.62),
              height: Math.round(headSize * 0.24),
              borderRadius: Math.round(headSize * 0.12)
            }
          ]}
        />
        <View
          style={[
            styles.core,
            {
              width: coreSize,
              height: coreSize,
              borderRadius: Math.round(coreSize / 2),
              marginTop: Math.round(headSize * 0.1)
            }
          ]}
        >
          <ServiceLogo
            providerName={providerName}
            logoMode={logoMode}
            size={Math.round(coreSize * logoScale)}
          />
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrap: {
      position: "relative"
    },
    ear: {
      position: "absolute",
      zIndex: 1,
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      overflow: "hidden",
      ...shadows.card
    },
    earLeft: {
      transform: [{ rotate: "-4deg" }]
    },
    earRight: {
      transform: [{ rotate: "4deg" }]
    },
    earHighlight: {
      marginTop: Math.round(spacing.xs * 0.5),
      backgroundColor: "rgba(255,255,255,0.12)"
    },
    head: {
      position: "absolute",
      zIndex: 2,
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      ...shadows.card
    },
    headHighlight: {
      position: "absolute",
      top: Math.round(spacing.xs * 0.75),
      backgroundColor: "rgba(255,255,255,0.12)"
    },
    core: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colorBlindMode ? "rgba(8,18,31,0.44)" : "rgba(0,0,0,0.18)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)"
    }
  });
