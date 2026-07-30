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
    if (saved === "dark" || saved === "light" || saved === "system") {
      return saved as Theme;
    }
    return "system";
  });

  const getEffectiveTheme = (mode: Theme): "light" | "dark" => {
    if (mode === "system") {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return mode;
  };

  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(() =>
    getEffectiveTheme(theme),
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const update = () => {
      const eff = getEffectiveTheme(theme);
      setEffectiveTheme(eff);
      const root = document.documentElement;
      if (eff === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    update();
    localStorage.setItem("farama_theme", theme);

    const listener = () => {
      if (theme === "system") {
        update();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
      return () => mediaQuery.removeListener(listener);
    }
  }, [theme]);

  useEffect(() => {
    if (profile?.id) {
      staffService
        .getPreferences(profile.id)
        .then((prefs) => {
          if (prefs?.theme) {
            const dbTheme = prefs.theme.toLowerCase() as Theme;
            if (
              dbTheme === "dark" ||
              dbTheme === "light" ||
              dbTheme === "system"
            ) {
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
      const dbVal =
        newTheme === "dark"
          ? "Dark"
          : newTheme === "system"
            ? "System"
            : "Light";
      staffService
        .updatePreferences(profile.id, {
          theme: dbVal,
        })
        .catch(() => {
          // fallback in staffService handles localStorage
        });
    }
  };

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <ThemeContext.Provider
      value={{ theme, effectiveTheme, toggleTheme, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
