import { StyleSheet, View } from "react-native";

import { AppTheme, shadows, useAppTheme } from "../theme";
import { ServiceLogo } from "./ServiceLogo";

type AsterixBubbleProps = {
  providerName: string;
  size: number;
  coreScale?: number;
  logoScale?: number;
};

export function AsterixBubble({
  providerName,
  size,
  coreScale = 0.29,
  logoScale = 0.82
}: AsterixBubbleProps): JSX.Element {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const shellFill = theme.colorBlindMode ? "rgba(215,236,250,0.18)" : "rgba(255,255,255,0.09)";
  const shellBorder = theme.colorBlindMode ? "rgba(215,236,250,0.3)" : "rgba(255,255,255,0.18)";
  const shellHighlight = theme.colorBlindMode ? "rgba(244,250,255,0.28)" : "rgba(255,255,255,0.13)";
  const coreSize = Math.round(size * coreScale);

  const wingFeathers = [
    {
      width: Math.round(size * 0.42),
      height: Math.round(size * 0.1),
      top: Math.round(size * 0.08),
      left: Math.round(size * 0.02),
      rotate: "-7deg"
    },
    {
      width: Math.round(size * 0.34),
      height: Math.round(size * 0.09),
      top: Math.round(size * 0.16),
      left: Math.round(size * 0.13),
      rotate: "7deg"
    },
    {
      width: Math.round(size * 0.22),
      height: Math.round(size * 0.075),
      top: Math.round(size * 0.24),
      left: Math.round(size * 0.27),
      rotate: "15deg"
    }
  ];

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {wingFeathers.map((feather, index) => (
        <View
          key={`wing-${index}`}
          style={[
            styles.piece,
            styles.wingFeather,
            {
              width: feather.width,
              height: feather.height,
              borderRadius: Math.round(feather.height * 0.54),
              top: feather.top,
              left: feather.left,
              backgroundColor: shellFill,
              borderColor: shellBorder,
              transform: [{ rotate: feather.rotate }]
            }
          ]}
        >
          <View
            style={[
              styles.highlight,
              {
                width: Math.round(feather.width * 0.56),
                height: Math.max(3, Math.round(feather.height * 0.22)),
                borderRadius: Math.round(feather.height * 0.12),
                marginTop: Math.max(2, Math.round(feather.height * 0.16))
              }
            ]}
          />
        </View>
      ))}

      <View
        style={[
          styles.piece,
          styles.wingAnchor,
          {
            width: Math.round(size * 0.12),
            height: Math.round(size * 0.12),
            borderRadius: Math.round(size * 0.06),
            top: Math.round(size * 0.22),
            left: Math.round(size * 0.46),
            backgroundColor: shellFill,
            borderColor: shellBorder
          }
        ]}
      />

      <View
        style={[
          styles.piece,
          styles.helmetTop,
          {
            width: Math.round(size * 0.38),
            height: Math.round(size * 0.2),
            borderRadius: Math.round(size * 0.1),
            top: Math.round(size * 0.15),
            left: Math.round(size * 0.46),
            backgroundColor: shellFill,
            borderColor: shellBorder
          }
        ]}
      >
        <View
          style={[
            styles.highlight,
            {
              width: Math.round(size * 0.2),
              height: Math.max(4, Math.round(size * 0.04)),
              borderRadius: Math.round(size * 0.02),
              marginTop: Math.round(size * 0.03)
            }
          ]}
        />
      </View>

      <View
        style={[
          styles.piece,
          styles.helmetBand,
          {
            width: Math.round(size * 0.22),
            height: Math.round(size * 0.095),
            borderRadius: Math.round(size * 0.045),
            top: Math.round(size * 0.27),
            left: Math.round(size * 0.53),
            backgroundColor: shellFill,
            borderColor: shellBorder
          }
        ]}
      />

      <View
        style={[
          styles.piece,
          styles.head,
          {
            width: Math.round(size * 0.35),
            height: Math.round(size * 0.42),
            borderRadius: Math.round(size * 0.18),
            top: Math.round(size * 0.29),
            left: Math.round(size * 0.49),
            backgroundColor: shellFill,
            borderColor: shellBorder
          }
        ]}
      />

      <View
        style={[
          styles.piece,
          styles.eye,
          {
            width: Math.round(size * 0.075),
            height: Math.round(size * 0.075),
            borderRadius: Math.round(size * 0.038),
            top: Math.round(size * 0.43),
            left: Math.round(size * 0.61),
            backgroundColor: shellHighlight,
            borderColor: "rgba(255,255,255,0.08)"
          }
        ]}
      />

      <View
        style={[
          styles.piece,
          styles.nose,
          {
            width: Math.round(size * 0.25),
            height: Math.round(size * 0.16),
            borderRadius: Math.round(size * 0.08),
            top: Math.round(size * 0.39),
            left: Math.round(size * 0.73),
            backgroundColor: shellFill,
            borderColor: shellBorder
          }
        ]}
      />

      <View
        style={[
          styles.piece,
          styles.moustacheLeft,
          {
            width: Math.round(size * 0.19),
            height: Math.round(size * 0.095),
            borderRadius: Math.round(size * 0.05),
            top: Math.round(size * 0.54),
            left: Math.round(size * 0.49),
            backgroundColor: shellFill,
            borderColor: shellBorder
          }
        ]}
      />

      <View
        style={[
          styles.piece,
          styles.moustacheRight,
          {
            width: Math.round(size * 0.22),
            height: Math.round(size * 0.105),
            borderRadius: Math.round(size * 0.055),
            top: Math.round(size * 0.58),
            left: Math.round(size * 0.63),
            backgroundColor: shellFill,
            borderColor: shellBorder
          }
        ]}
      />

      <View
        style={[
          styles.piece,
          styles.chin,
          {
            width: Math.round(size * 0.21),
            height: Math.round(size * 0.12),
            borderRadius: Math.round(size * 0.06),
            top: Math.round(size * 0.67),
            left: Math.round(size * 0.58),
            backgroundColor: shellFill,
            borderColor: shellBorder
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
            top: Math.round(size * 0.43),
            left: Math.round(size * 0.39)
          }
        ]}
      >
        <ServiceLogo providerName={providerName} size={Math.round(coreSize * logoScale)} />
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrap: {
      position: "relative"
    },
    piece: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "flex-start",
      overflow: "hidden",
      borderWidth: 1,
      ...shadows.card
    },
    wingFeather: {
      zIndex: 1
    },
    wingAnchor: {
      zIndex: 2
    },
    helmetTop: {
      zIndex: 3
    },
    helmetBand: {
      zIndex: 4
    },
    head: {
      zIndex: 5
    },
    eye: {
      zIndex: 6
    },
    nose: {
      zIndex: 7
    },
    moustacheLeft: {
      zIndex: 8,
      transform: [{ rotate: "-26deg" }]
    },
    moustacheRight: {
      zIndex: 8,
      transform: [{ rotate: "18deg" }]
    },
    chin: {
      zIndex: 4,
      transform: [{ rotate: "16deg" }]
    },
    highlight: {
      backgroundColor: "rgba(255,255,255,0.14)"
    },
    core: {
      position: "absolute",
      zIndex: 9,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colorBlindMode ? "rgba(8,18,31,0.46)" : "rgba(0,0,0,0.2)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      ...shadows.card
    }
  });
