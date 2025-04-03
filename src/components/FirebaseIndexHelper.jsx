import React from "react";
import { FaExclamationTriangle, FaExternalLinkAlt } from "react-icons/fa";

/**
 * Komponent pomocniczy do obsługi błędów indeksu Firebase
 * Wyświetla informacje o brakującym indeksie i link do jego utworzenia
 */
const FirebaseIndexHelper = ({ indexUrl }) => {
  return (
    <div className="bg-yellow-800/30 border border-yellow-600/50 p-4 rounded-lg mb-6 animate-fadeIn">
      <div className="flex items-start">
        <div className="mr-3 pt-1">
          <FaExclamationTriangle className="text-yellow-500 text-xl" />
        </div>
        <div>
          <h3 className="text-yellow-500 font-semibold text-lg mb-2">
            Wymagany indeks Firebase
          </h3>
          <p className="text-gray-300 mb-3">
            Twoja aplikacja wymaga utworzenia nowego indeksu w bazie danych
            Firebase Firestore, aby poprawnie wyszukiwać i sortować dane. To
            jest jednorazowy proces konfiguracji.
          </p>
          <div className="space-y-2">
            <p className="text-gray-300 mb-1">Jak rozwiązać ten problem:</p>
            <ol className="list-decimal pl-5 text-gray-300 space-y-2">
              <li>Kliknij poniższy link, aby przejść do konsoli Firebase</li>
              <li>
                Zaloguj się do swojego konta Firebase (jeśli nie jesteś
                zalogowany)
              </li>
              <li>
                Na stronie, która się otworzy, kliknij przycisk "Utwórz indeks"
              </li>
              <li>Odśwież tę stronę po utworzeniu indeksu</li>
            </ol>
            <a
              href={indexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 mt-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition duration-200"
            >
              Utwórz brakujący indeks
              <FaExternalLinkAlt className="ml-2 text-sm" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseIndexHelper;
