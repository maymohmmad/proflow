import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react"
import { accentColors } from "../theme";

type ThemeContextType = {
  accentColor: string;
  setAccentColor: (color: string) => void;
  density: string;
  setDensity: (density: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [accentColor, setAccentColorState] = useState(
    localStorage.getItem("accentColor") || "indigo"
  );
  const [density, setDensityState] = useState(
    localStorage.getItem("density") || "comfortable"
  );

 const setAccentColor = (color: string) => {
  localStorage.setItem("accentColor", color);
  setAccentColorState(color);
  document.documentElement.style.setProperty(
    "--accent",
    accentColors[color] || "#6366f1"
  );
};

  const setDensity = (d: string) => {
    localStorage.setItem("density", d);
    setDensityState(d);
  };

useEffect(() => {
  const saved = localStorage.getItem("accentColor") || "indigo";
  setAccentColorState(saved);
  document.documentElement.style.setProperty(
    "--accent",
    accentColors[saved] || "#6366f1"
  );
}, []);

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor, density, setDensity }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
};