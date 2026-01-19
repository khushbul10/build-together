"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse" />;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center h-8 rounded-full w-16 transition-colors bg-gray-200 dark:bg-gray-700"
      aria-label="Toggle dark mode"
    >
      <span
        className={`${
          theme === "dark" ? "translate-x-8" : "translate-x-1"
        } inline-block w-6 h-6 transform bg-white rounded-full transition-transform`}
      />
    </button>
  );
}

