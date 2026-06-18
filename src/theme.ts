const savedAccent = localStorage.getItem("accentColor") || "indigo";
const savedTheme = localStorage.getItem("appTheme") || "dark";

const accentMap: Record<string, string> = {
  indigo: "#6366f1",
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  purple: "#8b5cf6",
};

export const accentColors = accentMap;

const darkTheme = {
  bg: "#0f172a",
  surface: "#1e293b",
  surfaceHover: "#263548",
  border: "#334155",
  textPrimary: "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted: "#475569",
};

const lightTheme = {
  bg: "#f8fafc",
  surface: "#ffffff",
  surfaceHover: "#f1f5f9",
  border: "#e2e8f0",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
};

const colors = savedTheme === "light" ? lightTheme : darkTheme;

export const theme = {
  ...colors,
  accent: accentMap[savedAccent] || "#6366f1",
  accentHover: "#4f46e5",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  successBg: "rgba(16,185,129,0.15)",
  warningBg: "rgba(245,158,11,0.15)",
  dangerBg: "rgba(239,68,68,0.15)",
};