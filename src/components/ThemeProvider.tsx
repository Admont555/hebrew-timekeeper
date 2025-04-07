"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isAutoTheme: boolean;
  setAutoTheme: (isAuto: boolean) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  isAutoTheme: false,
  setAutoTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    // Then check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  
  const [isAutoTheme, setAutoTheme] = useState<boolean>(() => {
    const auto = localStorage.getItem("autoTheme");
    return auto === "true";
  });

  // Function to determine theme based on time of day
  const getTimeBasedTheme = (): Theme => {
    const currentHour = new Date().getHours();
    // Set dark mode between 7PM (19) and 7AM (7)
    return (currentHour >= 19 || currentHour < 7) ? "dark" : "light";
  };

  // Update theme based on time when auto mode is enabled
  useEffect(() => {
    if (!isAutoTheme) return;
    
    // Set initial theme based on time
    setTheme(getTimeBasedTheme());
    
    // Check every minute for time-based changes
    const interval = setInterval(() => {
      setTheme(getTimeBasedTheme());
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [isAutoTheme]);

  useEffect(() => {
    // Save auto theme preference to localStorage
    localStorage.setItem("autoTheme", isAutoTheme ? "true" : "false");
    
    // Only save manual theme selection when not in auto mode
    if (!isAutoTheme) {
      localStorage.setItem("theme", theme);
    }
    
    // Update document class
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, isAutoTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme") && !isAutoTheme) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isAutoTheme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      if (!isAutoTheme) {
        setTheme(newTheme);
      }
    },
    isAutoTheme,
    setAutoTheme: (isAuto: boolean) => {
      setAutoTheme(isAuto);
      if (!isAuto) {
        // If turning off auto mode, keep current theme
        localStorage.setItem("theme", theme);
      }
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
