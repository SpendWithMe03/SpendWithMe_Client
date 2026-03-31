import { useState, useEffect } from "react";
import { Sun, Moon } from 'lucide-react';

function DarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    // Only access localStorage if running in browser
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDarkMode}
        className="relative p-2 rounded-full bg-gradient-to-br from-white to-gray-100 
                  dark:from-gray-800 dark:to-gray-900 hover:from-gray-50 hover:to-gray-200
                  dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300
                  active:scale-95 transform border border-gray-200 dark:border-gray-700
                  overflow-hidden"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        <div className="relative z-10">
          <Sun className={`w-6 h-6 text-yellow-500 transition-all duration-500
                          ${darkMode ? 'opacity-0 scale-50 rotate-180' : 'opacity-100 scale-100 rotate-0'}`} 
               style={{ position: darkMode ? 'absolute' : 'relative', top: 0, left: 0 }} />
          <Moon className={`w-6  h-6 text-blue-400 transition-all duration-500
                           ${darkMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-180'}`}
                style={{ position: !darkMode ? 'absolute' : 'relative', top: 0, left: 0 }} />
        </div>
        <div className={`absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-50 
                       dark:from-blue-900/30 dark:to-indigo-900/30 opacity-30 dark:opacity-50
                       transition-opacity duration-300`}></div>
      </button>
    </div>
  );
}

export default DarkMode;