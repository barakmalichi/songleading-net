"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function HomeThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("songleading-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(stored ? stored === "dark" : prefersDark);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.siteTheme = isDark ? "dark" : "";
    window.localStorage.setItem("songleading-theme", isDark ? "dark" : "light");
  }, [isDark, ready]);

  return (
    <button
      type="button"
      className={`home-theme-toggle ${isDark ? "is-dark" : ""}`}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      title="Toggle dark mode"
      onClick={() => setIsDark((current) => !current)}
    >
      <Moon className="home-theme-icon home-theme-icon-moon" size={18} aria-hidden="true" />
      <Sun className="home-theme-icon home-theme-icon-sun" size={18} aria-hidden="true" />
    </button>
  );
}
