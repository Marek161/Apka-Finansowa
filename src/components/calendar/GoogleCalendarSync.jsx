// Komponent do synchronizacji z Google Calendar
import React, { useState } from "react";
import { FaGoogle, FaCalendarAlt, FaSync } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import {
  syncWithGoogleCalendar,
  authorizeGoogleCalendar,
} from "../../services/calendarService";

const GoogleCalendarSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  // Obsługa synchronizacji z Google Calendar
  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    setSuccess(false);

    try {
      // Sprawdzenie czy użytkownik jest już autoryzowany
      const accessToken = localStorage.getItem("googleAccessToken");
      if (!accessToken) {
        // Jeśli nie jest autoryzowany, przekieruj do procesu autoryzacji
        authorizeGoogleCalendar();
        return;
      }

      await syncWithGoogleCalendar(user.id);
      setSuccess(true);
    } catch (error) {
      setError("Wystąpił błąd podczas synchronizacji z Google Calendar");
      console.error("Błąd synchronizacji:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Synchronizacja z Google Calendar
      </h2>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <FaCalendarAlt className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Zsynchronizuj swoje transakcje z Google Calendar, aby otrzymywać
              przypomnienia o płatnościach.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Wymaga zalogowania się do konta Google
            </p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        {success && (
          <div className="text-sm text-green-600 dark:text-green-400">
            Synchronizacja zakończona pomyślnie!
          </div>
        )}

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isSyncing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSyncing ? (
            <>
              <FaSync className="mr-2 animate-spin" />
              Synchronizacja...
            </>
          ) : (
            <>
              <FaGoogle className="mr-2" />
              Zsynchronizuj z Google Calendar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GoogleCalendarSync;
