import { createContext, useContext } from "react";

const defaultColors = {
  primary: "#FFB84D",
  primaryStrong: "#FF9A3C",
  secondary: "#8C7BFF",
  success: "#45D48B",
  warning: "#FFB84D",
  danger: "#FF667A",
  background: "#050507",
  backgroundElevated: "#0B0B10",
  surface: "#111116",
  surfaceRaised: "#171720",
  surfaceMuted: "#1E1E2A",
  surfaceContrast: "#26263A",
  textPrimary: "#F5F7FA",
  textSecondary: "#A9AFC2",
  textTertiary: "#6E7389",
  border: "#232334",
  borderStrong: "#33344B",
  glowOrange: "rgba(255, 184, 77, 0.22)",
  glowPurple: "rgba(140, 123, 255, 0.18)",
  glowGreen: "rgba(69, 212, 139, 0.18)",
  white: "#FFFFFF"
};

const colorBlindColors = {
  primary: "#E69F00",
  primaryStrong: "#C68500",
  secondary: "#0072B2",
  success: "#009E73",
  warning: "#F0E442",
  danger: "#D55E00",
  background: "#071018",
  backgroundElevated: "#0D1722",
  surface: "#122131",
  surfaceRaised: "#172A3F",
  surfaceMuted: "#1D3550",
  surfaceContrast: "#244663",
  textPrimary: "#F6F9FC",
  textSecondary: "#BDD0E3",
  textTertiary: "#88A2BB",
  border: "#244158",
  borderStrong: "#335778",
  glowOrange: "rgba(230, 159, 0, 0.2)",
  glowPurple: "rgba(0, 114, 178, 0.18)",
  glowGreen: "rgba(0, 158, 115, 0.18)",
  white: "#FFFFFF"
};

export const colors = defaultColors;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40
};

export const radius = {
  sm: 14,
  md: 22,
  lg: 30,
  xl: 38
};

export const shadows = {
  card: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 8
  },
  glow: {
    shadowColor: "#FFB84D",
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8
  }
};

type ThemeColors = typeof defaultColors;

export type AppTheme = {
  colors: ThemeColors;
  chartColors: string[];
  colorBlindMode: boolean;
  statusBarStyle: "light" | "dark";
};

const defaultTheme: AppTheme = {
  colors: defaultColors,
  chartColors: [
    defaultColors.primary,
    defaultColors.secondary,
    defaultColors.success,
    defaultColors.danger,
    "#7BE7FF",
    "#F38BFF"
  ],
  colorBlindMode: false,
  statusBarStyle: "light"
};

const colorBlindTheme: AppTheme = {
  colors: colorBlindColors,
  chartColors: [
    colorBlindColors.primary,
    colorBlindColors.secondary,
    colorBlindColors.success,
    colorBlindColors.danger,
    "#56B4E9",
    "#F0E442"
  ],
  colorBlindMode: true,
  statusBarStyle: "light"
};

export const AppThemeContext = createContext<AppTheme>(defaultTheme);

export function getAppTheme(colorBlindMode: boolean): AppTheme {
  return colorBlindMode ? colorBlindTheme : defaultTheme;
}

export function useAppTheme(): AppTheme {
  return useContext(AppThemeContext);
}
