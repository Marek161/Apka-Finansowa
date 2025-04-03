import React, { useState } from "react";
import { FaInfoCircle, FaTimes } from "react-icons/fa";

/**
 * Komponent pomocniczy DevelopmentHelper - wyświetla informacje na temat powszechnych błędów deweloperskich
 * i ich rozwiązań. Widoczny tylko w trybie deweloperskim.
 */
const DevelopmentHelper = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (process.env.NODE_ENV !== "development" || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 animate-fadeIn">
      <div className="flex justify-between items-start p-4 border-b border-gray-700">
        <div className="flex items-center">
          <FaInfoCircle className="text-blue-400 mr-2" />
          <h3 className="text-white font-medium">Informacje deweloperskie</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h4 className="text-yellow-400 font-medium mb-1">Błędy WebSocket</h4>
          <p className="text-gray-300 text-sm">
            Komunikaty o błędach WebSocket w konsoli są związane z funkcją
            hot-reloadingu i nie wpływają na działanie aplikacji. Jeśli chcesz
            je wyłączyć, dodaj{" "}
            <code className="bg-gray-700 px-1 rounded">WDS_SOCKET_PORT=0</code>{" "}
            do pliku{" "}
            <code className="bg-gray-700 px-1 rounded">.env.development</code>.
          </p>
        </div>

        <div className="mb-3">
          <h4 className="text-yellow-400 font-medium mb-1">
            Błędy indeksu Firebase
          </h4>
          <p className="text-gray-300 text-sm">
            Błędy dotyczące brakujących indeksów w Firebase mogą wystąpić przy
            złożonych zapytaniach. Kliknij link podany w błędzie, aby utworzyć
            indeks.
          </p>
        </div>

        <div>
          <h4 className="text-blue-400 font-medium mb-1">Wskazówka</h4>
          <p className="text-gray-300 text-sm">
            W trybie deweloperskim port 3000 może być zajęty. Aplikacja
            automatycznie wybierze inny wolny port (np. 3001, 3002).
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentHelper;
