import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps): JSX.Element {
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconShell, compact ? styles.iconShellCompact : null]}>
        <View style={[styles.iconBase, compact ? styles.iconBaseCompact : null]}>
          <View style={[styles.backCardOne, compact ? styles.backCardOneCompact : null]} />
          <View style={[styles.backCardTwo, compact ? styles.backCardTwoCompact : null]} />
          <View style={[styles.frontCard, compact ? styles.frontCardCompact : null]}>
            <View style={[styles.frontCardGlow, compact ? styles.frontCardGlowCompact : null]} />
            <View style={[styles.orangeDot, compact ? styles.orangeDotCompact : null]} />
            <View style={[styles.checkLeft, compact ? styles.checkLeftCompact : null]} />
            <View style={[styles.checkRight, compact ? styles.checkRightCompact : null]} />
            <View style={[styles.barOne, compact ? styles.barOneCompact : null]} />
            <View style={[styles.barTwo, compact ? styles.barTwoCompact : null]} />
            <View style={[styles.barThree, compact ? styles.barThreeCompact : null]} />
            <View style={[styles.barFour, compact ? styles.barFourCompact : null]} />
            <View style={[styles.swoosh, compact ? styles.swooshCompact : null]} />
          </View>
        </View>
      </View>

      <View style={styles.wordmark}>
        <Text style={[styles.brandName, compact ? styles.brandNameCompact : null]}>
          SubTrack
        </Text>
        <Text style={[styles.brandMeta, compact ? styles.brandMetaCompact : null]}>
          Track every subscription
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  iconShell: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0912",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.34,
    shadowRadius: 18,
    elevation: 10
  },
  iconShellCompact: {
    width: 46,
    height: 46,
    borderRadius: 16
  },
  iconBase: {
    width: 50,
    height: 50,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#110F23",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  iconBaseCompact: {
    width: 42,
    height: 42,
    borderRadius: 14
  },
  backCardOne: {
    position: "absolute",
    width: 34,
    height: 34,
    bottom: 6,
    left: 4,
    borderRadius: 12,
    backgroundColor: "#2E45D2",
    opacity: 0.8,
    transform: [{ rotate: "-12deg" }]
  },
  backCardOneCompact: {
    width: 28,
    height: 28,
    bottom: 5,
    left: 3,
    borderRadius: 10
  },
  backCardTwo: {
    position: "absolute",
    width: 34,
    height: 34,
    bottom: 5,
    right: 3,
    borderRadius: 12,
    backgroundColor: "#181A4A",
    opacity: 0.9,
    transform: [{ rotate: "10deg" }]
  },
  backCardTwoCompact: {
    width: 28,
    height: 28,
    bottom: 4,
    right: 2,
    borderRadius: 10
  },
  frontCard: {
    position: "absolute",
    left: 8,
    top: 7,
    width: 38,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#5C25E6",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    transform: [{ rotate: "-10deg" }]
  },
  frontCardCompact: {
    left: 7,
    top: 6,
    width: 31,
    height: 28,
    borderRadius: 10
  },
  frontCardGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "rgba(188, 135, 255, 0.28)"
  },
  frontCardGlowCompact: {
    height: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  orangeDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#FFB400",
    shadowColor: "#FFB400",
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4
  },
  orangeDotCompact: {
    width: 6,
    height: 6
  },
  checkLeft: {
    position: "absolute",
    left: 8,
    top: 17,
    width: 11,
    height: 4,
    borderRadius: 3,
    backgroundColor: colors.white,
    transform: [{ rotate: "42deg" }]
  },
  checkLeftCompact: {
    left: 6,
    top: 14,
    width: 9,
    height: 3.5
  },
  checkRight: {
    position: "absolute",
    left: 14,
    top: 12,
    width: 18,
    height: 4,
    borderRadius: 3,
    backgroundColor: colors.white,
    transform: [{ rotate: "-46deg" }]
  },
  checkRightCompact: {
    left: 11,
    top: 10,
    width: 15,
    height: 3.5
  },
  barOne: {
    position: "absolute",
    bottom: 5,
    right: 18,
    width: 4,
    height: 6,
    borderRadius: 2,
    backgroundColor: "#6C56FF"
  },
  barOneCompact: {
    right: 15,
    width: 3.5,
    height: 5
  },
  barTwo: {
    position: "absolute",
    bottom: 5,
    right: 12,
    width: 4,
    height: 9,
    borderRadius: 2,
    backgroundColor: "#7C6AFF"
  },
  barTwoCompact: {
    right: 10,
    width: 3.5,
    height: 7
  },
  barThree: {
    position: "absolute",
    bottom: 5,
    right: 6,
    width: 4,
    height: 13,
    borderRadius: 2,
    backgroundColor: "#8FA8FF"
  },
  barThreeCompact: {
    right: 5,
    width: 3.5,
    height: 10
  },
  barFour: {
    position: "absolute",
    bottom: 5,
    right: 0,
    width: 4,
    height: 17,
    borderRadius: 2,
    backgroundColor: "#7AA5FF"
  },
  barFourCompact: {
    right: 0,
    width: 3.5,
    height: 13
  },
  swoosh: {
    position: "absolute",
    left: 1,
    right: -1,
    bottom: 2,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#FFB400",
    transform: [{ rotate: "3deg" }]
  },
  swooshCompact: {
    height: 4
  },
  wordmark: {
    gap: 1
  },
  brandName: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
    color: colors.textPrimary
  },
  brandNameCompact: {
    fontSize: 15
  },
  brandMeta: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.85,
    textTransform: "uppercase",
    color: colors.textTertiary
  },
  brandMetaCompact: {
    fontSize: 9
  }
});
