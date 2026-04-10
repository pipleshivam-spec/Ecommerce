import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme =
  | "light" | "dark" | "ocean" | "sunset" | "forest"
  | "lavender" | "rose" | "midnight" | "coffee" | "mint";

export const ALL_THEMES: Theme[] = [
  "light", "dark", "ocean", "sunset", "forest",
  "lavender", "rose", "midnight", "coffee", "mint",
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  ALL_THEMES.forEach(t => root.classList.remove(t));
  root.classList.add(theme);
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("maison-theme") as Theme | null;
    return saved && ALL_THEMES.includes(saved) ? saved : "dark";
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("maison-theme", theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState(t => t === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
