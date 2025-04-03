import React from "react";

// Komponent wyświetlający ekran ładowania
const LoadingScreen = () => {
  return (
    // Kontener centrujący zawartość na całym ekranie
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        {/* Animowany spinner ładowania */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        {/* Tekst informujący o ładowaniu */}
        <p className="mt-4 text-gray-600">Ładowanie...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
