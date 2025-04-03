import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  FaPlus,
  FaFilter,
  FaTrash,
  FaEdit,
  FaFileExport,
  FaFileDownload,
  FaFileUpload,
  FaSync,
  FaExclamationTriangle,
  FaAngleDown,
  FaAngleUp,
  FaSearch,
  FaTimes,
  FaWallet,
  FaSpinner,
} from "react-icons/fa";
import {
  TRANSACTION_CATEGORIES,
  getCategoriesByType,
} from "../utils/transactionCategories";

// Połączenie wszystkich kategorii
const ALL_CATEGORIES = [
  ...TRANSACTION_CATEGORIES.income,
  ...TRANSACTION_CATEGORIES.expense,
];

const Transactions = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'income', 'expense'
  const [categoryFilter, setCategoryFilter] = useState(""); // Filtr kategorii
  const [searchQuery, setSearchQuery] = useState(""); // Wyszukiwanie
  const [dateRange, setDateRange] = useState({ start: "", end: "" }); // Zakres dat
  const [sortBy, setSortBy] = useState("date"); // Sortowanie
  const [sortOrder, setSortOrder] = useState("desc"); // Kierunek sortowania
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [indexError, setIndexError] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [importingCSV, setImportingCSV] = useState(false); // Stan dla importu CSV
  const [importResults, setImportResults] = useState(null); // Wyniki importu
  const fileInputRef = useRef(null); // Ref do pola input file
  const navigate = useNavigate();

  const fetchTransactions = () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setIndexError(false);

    try {
      const transactionsRef = collection(db, "transactions");
      let queryConstraints = [where("userId", "==", currentUser.uid)];

      // Dodawanie filtrów
      if (filter !== "all") {
        queryConstraints.push(where("type", "==", filter));
      }

      if (categoryFilter && categoryFilter !== "all") {
        queryConstraints = [
          where("userId", "==", currentUser.uid),
          where("category", "==", categoryFilter),
        ];
      }

      // Dodawanie sortowania na końcu
      queryConstraints.push(orderBy("date", "desc"));

      // Tworzenie zapytania ze wszystkimi ograniczeniami
      const q = query(transactionsRef, ...queryConstraints);

      // Używamy onSnapshot do słuchania zmian w czasie rzeczywistym
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          try {
            const transactionList = querySnapshot.docs.map((doc) => {
              const data = doc.data();
              let transactionDate;
              try {
                if (data.date instanceof Timestamp) {
                  transactionDate = data.date.toDate();
                } else if (data.date?.toDate) {
                  transactionDate = data.date.toDate();
                } else if (data.date) {
                  transactionDate = new Date(data.date);
                } else {
                  transactionDate = new Date();
                }
              } catch (dateError) {
                console.error("Błąd konwersji daty:", dateError);
                transactionDate = new Date();
              }

              return {
                id: doc.id,
                ...data,
                date: transactionDate,
              };
            });

            setTransactions(transactionList);
            setLoading(false);
            setRetrying(false);
            if (error) {
              setSuccessMessage("Udało się odświeżyć dane!");
              setTimeout(() => setSuccessMessage(""), 3000);
            }
            setError("");
          } catch (processingError) {
            console.error("Błąd przetwarzania transakcji:", processingError);
            setError("Błąd przetwarzania danych transakcji.");
            setLoading(false);
            setRetrying(false);
          }
        },
        (snapshotError) => {
          console.error("Błąd pobierania transakcji:", snapshotError);
          // Wyświetl dokładny błąd w konsoli, aby zobaczyć jakiego indeksu brakuje
          console.log("Szczegóły błędu:", snapshotError.message);

          if (
            snapshotError.message &&
            snapshotError.message.includes("index")
          ) {
            setIndexError(true);
            const indexUrl =
              snapshotError.message.match(/https:\/\/[^\s]+/)?.[0] || "";
            setError(
              `Wymagane jest utworzenie indeksu w Firebase. ${indexUrl ? `Kliknij link aby utworzyć indeks automatycznie: ${indexUrl}` : ""}`
            );
          } else {
            setError(
              `Wystąpił błąd podczas pobierania transakcji: ${snapshotError.message}`
            );
          }
          setLoading(false);
          setRetrying(false);
        }
      );

      return unsubscribe;
    } catch (setupError) {
      console.error("Błąd konfiguracji zapytania:", setupError);
      if (setupError.message && setupError.message.includes("index")) {
        setIndexError(true);
        const indexUrl =
          setupError.message.match(/https:\/\/[^\s]+/)?.[0] || "";
        setError(
          `Wymagane jest utworzenie indeksu w Firebase. ${indexUrl ? `Kliknij link aby utworzyć indeks automatycznie: ${indexUrl}` : ""}`
        );
      } else {
        setError(`Błąd konfiguracji zapytania: ${setupError.message}`);
      }
      setLoading(false);
      setRetrying(false);
      return () => {};
    }
  };

  useEffect(() => {
    const unsubscribe = fetchTransactions();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, filter, categoryFilter]);

  // Filtruj kategorie na podstawie wybranego filtra typu transakcji
  const getFilteredCategories = () => {
    if (filter === "income") {
      return TRANSACTION_CATEGORIES.income;
    } else if (filter === "expense") {
      return TRANSACTION_CATEGORIES.expense;
    } else {
      return ALL_CATEGORIES;
    }
  };

  // Funkcja resetująca filtry
  const resetFilters = () => {
    setFilter("all");
    setCategoryFilter("");
    setSearchQuery("");
    setDateRange({ start: "", end: "" });
    setSortBy("date");
    setSortOrder("desc");
  };

  // Filtrowanie transakcji według typu i kategorii (po stronie klienta)
  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Filtrowanie według kategorii po stronie klienta
    if (categoryFilter && categoryFilter !== "") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    // Filtrowanie według wyszukiwania (w tytule lub notatce)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(query)) ||
          (t.note && t.note.toLowerCase().includes(query))
      );
    }

    // Filtrowanie według zakresu dat
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0); // początek dnia
      filtered = filtered.filter((t) => new Date(t.date) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // koniec dnia
      filtered = filtered.filter((t) => new Date(t.date) <= endDate);
    }

    // Sortowanie
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (sortBy === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      } else if (sortBy === "title") {
        const titleA = a.title || "";
        const titleB = b.title || "";
        return sortOrder === "asc"
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      }
      return 0;
    });

    return filtered;
  };

  // Obsługa zmiany zakresu dat
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  // Obsługa sortowania
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Jeśli kliknięto na to samo pole, zmień kierunek sortowania
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Jeśli kliknięto na inne pole, ustaw jako nowe pole sortowania z domyślnym kierunkiem
      setSortBy(field);
      setSortOrder("desc"); // Domyślnie malejąco
    }
  };

  const handleRetry = () => {
    setRetrying(true);
    fetchTransactions();
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę transakcję?")) {
      try {
        await deleteDoc(doc(db, "transactions", id));
        setSuccessMessage("Transakcja została pomyślnie usunięta.");

        // Usuń komunikat po 3 sekundach
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (error) {
        console.error("Error deleting transaction:", error);
        setError(`Nie udało się usunąć transakcji: ${error.message}`);
      }
    }
  };

  // Obsługa edycji transakcji
  const handleEditTransaction = (id) => {
    navigate(`/transactions/edit/${id}`);
  };

  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "Nieprawidłowa data";
    }
    return date.toLocaleDateString("pl-PL");
  };

  const formatDateTime = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "Nieprawidłowa data";
    }
    return (
      date.toLocaleDateString("pl-PL") +
      " " +
      date.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  // Funkcja importu pliku CSV
  const importFromCSV = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Obsługa wybranego pliku CSV
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Sprawdzanie typu pliku
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Proszę wybrać plik CSV.");
      return;
    }

    setImportingCSV(true);
    setError("");

    try {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const csvContent = event.target.result;
          const result = await parseCSVAndImport(csvContent);
          setImportResults(result);
          setSuccessMessage(
            `Pomyślnie zaimportowano ${result.success} transakcji`
          );

          // Resetowanie pola wyboru pliku
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (parseError) {
          console.error("Błąd podczas parsowania CSV:", parseError);
          setError(`Błąd importu: ${parseError.message}`);
        } finally {
          setImportingCSV(false);
        }
      };

      reader.onerror = () => {
        setError("Błąd odczytu pliku.");
        setImportingCSV(false);
      };

      reader.readAsText(file, "UTF-8");
    } catch (error) {
      console.error("Błąd importu CSV:", error);
      setError(`Wystąpił błąd podczas importu pliku: ${error.message}`);
      setImportingCSV(false);
    }
  };

  // Funkcja parsowania CSV i importu do bazy
  const parseCSVAndImport = async (csvContent) => {
    // Przygotowanie wyniku importu
    const result = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Dzielimy zawartość CSV na wiersze
    const rows = csvContent.split(/\r?\n/).filter((row) => row.trim());

    if (rows.length === 0) {
      throw new Error("Plik CSV jest pusty");
    }

    // Pierwszy wiersz to nagłówki
    const headers = rows[0].split(",").map((header) => header.trim());

    // Sprawdzamy, czy są wymagane kolumny
    const requiredColumns = ["Data", "Tytuł", "Kwota", "Typ", "Kategoria"];
    const missingColumns = requiredColumns.filter(
      (col) => !headers.includes(col)
    );

    if (missingColumns.length > 0) {
      throw new Error(
        `Brakujące wymagane kolumny: ${missingColumns.join(", ")}`
      );
    }

    // Indeksy kolumn
    const dateIndex = headers.indexOf("Data");
    const titleIndex = headers.indexOf("Tytuł");
    const amountIndex = headers.indexOf("Kwota");
    const typeIndex = headers.indexOf("Typ");
    const categoryIndex = headers.indexOf("Kategoria");
    const descriptionIndex = headers.indexOf("Opis");

    // Importowanie wierszy (od 1, pomijając nagłówki)
    for (let i = 1; i < rows.length; i++) {
      try {
        const columns = rows[i].split(",").map((col) => col.trim());

        if (
          columns.length <
          Math.max(
            dateIndex,
            titleIndex,
            amountIndex,
            typeIndex,
            categoryIndex
          ) +
            1
        ) {
          result.failed++;
          result.errors.push(`Wiersz ${i + 1}: Nieprawidłowa liczba kolumn`);
          continue;
        }

        // Parsowanie daty
        let transactionDate;
        try {
          const dateParts = columns[dateIndex].split(".");
          if (dateParts.length === 3) {
            // Format DD.MM.YYYY
            transactionDate = new Date(
              parseInt(dateParts[2]),
              parseInt(dateParts[1]) - 1,
              parseInt(dateParts[0])
            );
          } else {
            // Próba parsowania daty z formatu ISO lub innego
            transactionDate = new Date(columns[dateIndex]);
          }

          if (isNaN(transactionDate.getTime())) {
            throw new Error("Nieprawidłowy format daty");
          }
        } catch (dateError) {
          result.failed++;
          result.errors.push(`Wiersz ${i + 1}: Nieprawidłowy format daty`);
          continue;
        }

        // Parsowanie kwoty
        let amount;
        try {
          // Zastępujemy przecinek kropką i parsujemy jako float
          amount = parseFloat(columns[amountIndex].replace(",", "."));
          if (isNaN(amount)) {
            throw new Error("Nieprawidłowa kwota");
          }
        } catch (amountError) {
          result.failed++;
          result.errors.push(`Wiersz ${i + 1}: Nieprawidłowa kwota`);
          continue;
        }

        // Sprawdzanie typu transakcji
        const type = columns[typeIndex].toLowerCase();
        if (type !== "income" && type !== "expense") {
          result.failed++;
          result.errors.push(
            `Wiersz ${i + 1}: Typ musi być "income" lub "expense"`
          );
          continue;
        }

        // Sprawdzanie kategorii
        const category = columns[categoryIndex];
        const validCategories =
          type === "income"
            ? TRANSACTION_CATEGORIES.income
            : TRANSACTION_CATEGORIES.expense;

        if (!validCategories.includes(category)) {
          result.failed++;
          result.errors.push(
            `Wiersz ${i + 1}: Nieprawidłowa kategoria dla typu ${type}`
          );
          continue;
        }

        // Przygotowanie obiektu transakcji
        const transaction = {
          title: columns[titleIndex],
          amount: amount,
          date: Timestamp.fromDate(transactionDate),
          type: type,
          category: category,
          description: descriptionIndex !== -1 ? columns[descriptionIndex] : "",
          userId: currentUser.uid,
          createdAt: Timestamp.now(),
        };

        // Dodanie transakcji do bazy danych
        await addDoc(collection(db, "transactions"), transaction);
        result.success++;
      } catch (rowError) {
        result.failed++;
        result.errors.push(`Wiersz ${i + 1}: ${rowError.message}`);
      }
    }

    return result;
  };

  // Poprawiona funkcja eksportu CSV z obsługą polskich znaków
  const exportToCSV = () => {
    try {
      if (transactions.length === 0) {
        setError("Brak transakcji do eksportu.");
        return;
      }

      const csvHeader = [
        "Data",
        "Tytuł",
        "Kwota",
        "Typ",
        "Kategoria",
        "Opis",
      ].join(",");

      const csvRows = transactions.map((transaction) => {
        const date =
          transaction.date instanceof Date
            ? transaction.date.toISOString().split("T")[0]
            : new Date(transaction.date).toISOString().split("T")[0];

        // Escapowanie pól tekstu, które mogą zawierać przecinki
        const escapeField = (field) => {
          if (field === null || field === undefined) return "";
          const stringField = String(field);
          // Jeśli pole zawiera przecinki, cudzysłowy lub nowe linie, otaczamy je cudzysłowami
          if (
            stringField.includes(",") ||
            stringField.includes('"') ||
            stringField.includes("\n")
          ) {
            // Podwajamy cudzysłowy wewnątrz pola
            return `"${stringField.replace(/"/g, '""')}"`;
          }
          return stringField;
        };

        return [
          date,
          escapeField(transaction.title),
          transaction.amount.toFixed(2),
          transaction.type === "expense" ? "Wydatek" : "Przychód",
          escapeField(transaction.category),
          escapeField(transaction.description),
        ].join(",");
      });

      const csvString = [csvHeader, ...csvRows].join("\n");

      // Dodanie BOM dla poprawnego wyświetlania polskich znaków w Excel
      const BOM = "\uFEFF";
      const csvContent = BOM + csvString;

      // Tworzenie Blob z odpowiednim typem MIME dla CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Zwolnienie pamięci

      setSuccessMessage("Transakcje zostały wyeksportowane do pliku CSV.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error exporting transactions:", error);
      setError(`Wystąpił błąd podczas eksportu transakcji: ${error.message}`);
    }
  };

  // Przełączanie widoczności filtrów
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // JSX dla wyników importu
  const renderImportResults = () => {
    if (!importResults) return null;

    return (
      <div className="mb-6 bg-gray-800/30 rounded-lg border border-gray-700/40 p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-white">Wyniki importu CSV</h3>
          <button
            onClick={() => setImportResults(null)}
            className="text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-3">
          <p className="text-gray-300">
            Zaimportowano:{" "}
            <span className="text-green-400 font-medium">
              {importResults.success}
            </span>{" "}
            transakcji
          </p>
          <p className="text-gray-300">
            Błędy:{" "}
            <span className="text-red-400 font-medium">
              {importResults.failed}
            </span>{" "}
            transakcji
          </p>
        </div>

        {importResults.errors.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-300 mb-1">
              Szczegóły błędów:
            </h4>
            <div className="bg-gray-700/30 rounded p-2 max-h-40 overflow-y-auto text-sm">
              <ul className="list-disc list-inside text-red-300">
                {importResults.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center mb-4 sm:mb-0">
            <FaWallet className="text-green-400 mr-3" />
            <span className="relative">
              Historia transakcji
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-transparent"></span>
            </span>
          </h1>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Link
              to="/transactions/new"
              className="px-5 py-3 bg-gradient-to-r from-green-400 to-cyan-500 rounded-lg text-white shadow-lg hover:from-green-500 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center font-medium text-base flex-1 sm:flex-initial"
            >
              <FaPlus className="mr-2" />
              Dodaj transakcję
            </Link>

            <button
              onClick={exportToCSV}
              className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center flex-1 sm:flex-initial"
            >
              <FaFileExport className="mr-2" />
              Eksportuj CSV
            </button>

            <button
              onClick={importFromCSV}
              disabled={importingCSV}
              className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg text-white shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center flex-1 sm:flex-initial"
            >
              {importingCSV ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Importowanie...
                </>
              ) : (
                <>
                  <FaFileUpload className="mr-2" />
                  Importuj CSV
                </>
              )}
            </button>

            {/* Ukryte pole input file */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              className="hidden"
            />
          </div>
        </div>

        {successMessage && (
          <div
            className="bg-green-900/30 text-green-200 border border-green-700 px-4 py-3 rounded-lg relative animate-[fade-in_0.3s_ease-out_forwards] mb-6"
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {error && (
          <div
            className="bg-red-900/30 text-red-200 border border-red-700 px-4 py-3 rounded-lg relative mb-6 flex items-start"
            role="alert"
          >
            <FaExclamationTriangle className="text-red-400 mr-2 mt-0.5" />
            <div>
              <span className="block font-medium mb-1">Wystąpił błąd</span>
              <span className="block sm:inline">{error}</span>
              {indexError && (
                <a
                  href="https://console.firebase.google.com/project/_/firestore/indexes"
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-2 text-blue-400 hover:text-blue-300 underline"
                >
                  Utwórz indeks w Firebase Console
                </a>
              )}
            </div>
          </div>
        )}

        {importResults && renderImportResults()}

        {/* Filtry z możliwością zwinięcia */}
        <div className="bg-gray-800/30 rounded-lg p-4 mb-6 border border-gray-700/40">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={toggleFilters}
          >
            <div className="flex items-center">
              <FaFilter className="text-green-400 mr-2" />
              <span className="text-gray-300 mr-4">Filtry i wyszukiwanie:</span>
            </div>
            <div className="flex items-center">
              {filter !== "all" ||
              categoryFilter !== "" ||
              dateRange.start ||
              dateRange.end ||
              searchQuery ? (
                <span className="text-xs bg-green-600/40 text-green-200 px-2 py-1 rounded-full mr-2">
                  Aktywne filtry
                </span>
              ) : null}
              {showFilters ? (
                <FaAngleUp className="text-gray-400" />
              ) : (
                <FaAngleDown className="text-gray-400" />
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtr typu transakcji */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Typ transakcji
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      filter === "all"
                        ? "bg-gray-700 text-white shadow-md"
                        : "bg-gray-700/50 text-gray-400 hover:bg-gray-700/70 hover:text-gray-300"
                    } transition-all duration-200 flex-1`}
                  >
                    Wszystkie
                  </button>
                  <button
                    onClick={() => setFilter("income")}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      filter === "income"
                        ? "bg-green-800/80 text-green-200 shadow-md"
                        : "bg-green-800/30 text-gray-400 hover:bg-green-800/50 hover:text-gray-300"
                    } transition-all duration-200 flex-1`}
                  >
                    Przychody
                  </button>
                  <button
                    onClick={() => setFilter("expense")}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      filter === "expense"
                        ? "bg-red-800/80 text-red-200 shadow-md"
                        : "bg-red-800/30 text-gray-400 hover:bg-red-800/50 hover:text-gray-300"
                    } transition-all duration-200 flex-1`}
                  >
                    Wydatki
                  </button>
                </div>
              </div>

              {/* Filtr kategorii */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Kategoria
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-gray-700/50 text-gray-300 rounded-lg text-sm p-2 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                >
                  <option value="">Wszystkie kategorie</option>
                  {getFilteredCategories().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zakres dat */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Data od:
                </label>
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateChange}
                  className="w-full bg-gray-700/50 text-gray-300 rounded-lg text-sm p-2 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Data do:
                </label>
                <input
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateChange}
                  className="w-full bg-gray-700/50 text-gray-300 rounded-lg text-sm p-2 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                />
              </div>

              {/* Wyszukiwanie */}
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">
                  Wyszukaj w tytule lub notatce
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Wpisz tekst..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-700/50 text-gray-300 rounded-lg text-sm p-2 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  />
                </div>
              </div>

              {/* Przyciski resetowania */}
              <div className="md:col-span-2 flex justify-end items-end">
                {(filter !== "all" ||
                  categoryFilter !== "" ||
                  dateRange.start ||
                  dateRange.end ||
                  searchQuery) && (
                  <button
                    onClick={resetFilters}
                    className="px-3 py-2 bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white rounded-lg text-sm transition-all duration-200 flex items-center"
                  >
                    <FaSync className="mr-2" />
                    Resetuj filtry
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabela transakcji */}
        <div className="bg-gray-800/30 rounded-lg border border-gray-700/40 overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-400"></div>
              <span className="ml-3 text-gray-400">
                Ładowanie transakcji...
              </span>
            </div>
          ) : getFilteredTransactions().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700/40">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors duration-200"
                      onClick={() => handleSortChange("date")}
                    >
                      <div className="flex items-center">
                        Data
                        {sortBy === "date" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors duration-200"
                      onClick={() => handleSortChange("title")}
                    >
                      <div className="flex items-center">
                        Tytuł
                        {sortBy === "title" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      Kategoria
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      Typ
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors duration-200"
                      onClick={() => handleSortChange("amount")}
                    >
                      <div className="flex items-center">
                        Kwota
                        {sortBy === "amount" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/50 divide-y divide-gray-700/40">
                  {getFilteredTransactions().map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-700/30 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDateTime(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {transaction.title || "Bez tytułu"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {transaction.category || "Bez kategorii"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.type === "income"
                              ? "bg-green-900/50 text-green-300 border border-green-700/50"
                              : "bg-red-900/50 text-red-300 border border-red-700/50"
                          }`}
                        >
                          {transaction.type === "income"
                            ? "Przychód"
                            : "Wydatek"}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          transaction.type === "income"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {Number(transaction.amount).toFixed(2)}{" "}
                        {transaction.currency || "PLN"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() =>
                              handleEditTransaction(transaction.id)
                            }
                            className="text-blue-400 hover:text-blue-600 transition-colors duration-200"
                            title="Edytuj transakcję"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteTransaction(transaction.id)
                            }
                            className="text-red-400 hover:text-red-600 transition-colors duration-200"
                            title="Usuń transakcję"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-gray-400 text-center mb-4">
                {searchQuery ||
                filter !== "all" ||
                categoryFilter ||
                dateRange.start ||
                dateRange.end
                  ? "Nie znaleziono transakcji spełniających kryteria"
                  : "Nie masz jeszcze żadnych transakcji"}
              </div>
              {searchQuery ||
              filter !== "all" ||
              categoryFilter ||
              dateRange.start ||
              dateRange.end ? (
                <button onClick={resetFilters} className="btn-primary">
                  Resetuj filtry
                </button>
              ) : (
                <Link to="/transactions/new" className="btn-primary">
                  Dodaj pierwszą transakcję
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
