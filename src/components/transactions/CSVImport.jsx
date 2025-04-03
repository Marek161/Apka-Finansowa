// Komponent do importu transakcji z pliku CSV
import React, { useState } from "react";
import { FaFileCsv, FaUpload } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useAuth } from "../../contexts/AuthContext";
import { addTransaction } from "../../store/transactionsSlice";
import { parseCSV } from "../../utils/csvParser";

const CSVImport = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  // Obsługa wyboru pliku
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Proszę wybrać prawidłowy plik CSV");
      setFile(null);
    }
  };

  // Obsługa importu danych
  const handleImport = async () => {
    if (!file) {
      setError("Proszę wybrać plik do importu");
      return;
    }

    if (!currentUser) {
      setError("Musisz być zalogowany, aby importować transakcje");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvData = event.target.result;
        const transactions = parseCSV(csvData);

        // Dodanie każdej transakcji do store
        transactions.forEach((transaction) => {
          dispatch(
            addTransaction({
              ...transaction,
              userId: currentUser.uid,
              createdAt: new Date().toISOString(),
            })
          );
        });

        setSuccess(true);
        setFile(null);
        setError(null);
      };

      reader.onerror = () => {
        setError("Wystąpił błąd podczas odczytu pliku");
      };

      reader.readAsText(file);
    } catch (error) {
      setError("Wystąpił błąd podczas przetwarzania pliku CSV");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Import transakcji z CSV
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FaFileCsv className="w-10 h-10 text-gray-400 mb-2" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Kliknij aby wybrać plik</span>{" "}
                lub przeciągnij i upuść
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tylko pliki CSV
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {file && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Wybrany plik: {file.name}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        {success && (
          <div className="text-sm text-green-600 dark:text-green-400">
            Import zakończony pomyślnie!
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file}
          className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            file
              ? "bg-primary-600 hover:bg-primary-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          <FaUpload className="mr-2" />
          Importuj
        </button>
      </div>
    </div>
  );
};

export default CSVImport;
