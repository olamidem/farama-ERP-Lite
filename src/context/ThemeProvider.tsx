import React, { useEffect, useState } from "react";
import { ThemeContext, type Theme } from "./ThemeContext";
import { useAuthStore } from "../features/auth/store/authStore";
import { staffService } from "../features/staff/services/staff.service";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const profile = useAuthStore((state) => state.profile);
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("farama_theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("farama_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (profile?.id) {
      staffService
        .getPreferences(profile.id)
        .then((prefs) => {
          if (prefs?.theme) {
            const dbTheme = prefs.theme.toLowerCase() as Theme;
            if (dbTheme === "dark" || dbTheme === "light") {
              setThemeState(dbTheme);
            }
          }
        })
        .catch(() => {
          // ignore
        });
    }
  }, [profile?.id]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (profile?.id) {
      staffService
        .updatePreferences(profile.id, {
          theme: newTheme === "dark" ? "Dark" : "Light",
        })
        .catch(() => {
          // fallback in staffService handles localStorage
        });
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
