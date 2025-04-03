import React, { createContext, useState, useEffect } from "react";

// Utworzenie kontekstu motywu
export const ThemeContext = createContext();

// Provider kontekstu motywu
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Sprawdzenie czy użytkownik ma zapisane preferencje w localStorage
    const savedTheme = localStorage.getItem("darkMode");
    // Sprawdzenie czy użytkownik preferuje ciemny motyw na poziomie systemu
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Zwraca true jeśli zapisana preferencja to 'true' lub jeśli brak preferencji i system preferuje ciemny motyw
    return savedTheme === "true" || (savedTheme === null && prefersDark);
  });

  useEffect(() => {
    // Aktualizacja localStorage przy zmianie motywu
    localStorage.setItem("darkMode", darkMode);

    // Aktualizacja klasy dokumentu dla trybu ciemnego Tailwind
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Funkcja przełączająca tryb ciemny/jasny
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
