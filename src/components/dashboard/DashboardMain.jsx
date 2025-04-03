import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  FaChartLine,
  FaWallet,
  FaExchangeAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaPlus,
  FaChartPie,
  FaArrowRight,
  FaCalendarAlt,
  FaGoogle,
  FaBell,
  FaCheck,
  FaMoneyBillWave,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import DashboardStats from "./DashboardStats";
import DashboardCharts from "./DashboardCharts";
import RecentTransactions from "../../components/RecentTransactions";
import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Rejestracja komponentów ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardMain = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    count: 0,
  });
  const [authorizingGoogle, setAuthorizingGoogle] = useState(false);
  const [googleCalendarLinked, setGoogleCalendarLinked] = useState(false);
  const [calendarMessage, setCalendarMessage] = useState("");
  const [categorySpending, setCategorySpending] = useState({});
  const [categoryIncome, setCategoryIncome] = useState({});
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const transactionsRef = collection(db, "transactions");
        const q = query(
          transactionsRef,
          where("userId", "==", currentUser.uid),
          orderBy("date", "desc"),
          limit(100)
        );

        const querySnapshot = await getDocs(q);
        const transactionList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
            amount: Number(data.amount),
          };
        });

        setTransactions(transactionList);
        calculateStats(transactionList);
        calculateCategoryStats(transactionList);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError(
          "Wystąpił błąd podczas pobierania danych. Spróbuj ponownie później."
        );
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser]);

  // Nowa funkcja do obliczania statystyk kategorii
  const calculateCategoryStats = (transactions) => {
    const spendingByCategory = {};
    const incomeByCategory = {};

    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        const category = transaction.category || "Inne wydatki";
        if (!spendingByCategory[category]) {
          spendingByCategory[category] = 0;
        }
        spendingByCategory[category] += Number(transaction.amount);
      } else if (transaction.type === "income") {
        const category = transaction.category || "Inne przychody";
        if (!incomeByCategory[category]) {
          incomeByCategory[category] = 0;
        }
        incomeByCategory[category] += Number(transaction.amount);
      }
    });

    setCategorySpending(spendingByCategory);
    setCategoryIncome(incomeByCategory);
  };

  const calculateStats = (transactions) => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
    });

    setStats({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      count: transactions.length,
    });
  };

  // Funkcja symulująca synchronizację z Google Calendar
  // (w rzeczywistej implementacji użylibyśmy Google Calendar API)
  const handleGoogleCalendarSync = () => {
    setAuthorizingGoogle(true);
    setCalendarMessage("");

    // Symulacja procesu autoryzacji i synchronizacji
    setTimeout(() => {
      setAuthorizingGoogle(false);
      setGoogleCalendarLinked(true);
      setCalendarMessage(
        "Pomyślnie połączono z Google Calendar. Przypomnienia będą zsynchronizowane."
      );
    }, 2000);
  };

  // Funkcja formatująca liczby
  const formatNumber = (num) => {
    return new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Przygotowanie danych do wykresu kołowego wydatków
  const prepareExpensePieData = () => {
    const labels = Object.keys(categorySpending);

    const backgroundColors = [
      "#4F46E5", // indigo-600
      "#7C3AED", // violet-600
      "#EC4899", // pink-600
      "#EF4444", // red-500
      "#F59E0B", // amber-500
      "#10B981", // emerald-500
      "#3B82F6", // blue-500
      "#8B5CF6", // purple-500
    ];

    return {
      labels,
      datasets: [
        {
          data: labels.map((label) => categorySpending[label]),
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  };

  // Przygotowanie danych do wykresu przychodów według kategorii
  const prepareIncomePieData = () => {
    const incomeCategories = {};

    // Grupowanie przychodów według kategorii
    transactions
      .filter((t) => t.type === "income")
      .forEach((transaction) => {
        const category = transaction.category || "Inne";
        if (!incomeCategories[category]) {
          incomeCategories[category] = 0;
        }
        incomeCategories[category] += Number(transaction.amount);
      });

    // Sortowanie kategorii według wartości
    const sortedCategories = Object.entries(incomeCategories).sort(
      (a, b) => b[1] - a[1]
    );

    return {
      labels: sortedCategories.map(([category]) => category),
      datasets: [
        {
          data: sortedCategories.map(([_, value]) => value),
          backgroundColor: [
            "#10B981", // emerald-500
            "#3B82F6", // blue-500
            "#8B5CF6", // purple-500
            "#4F46E5", // indigo-600
            "#7C3AED", // violet-600
            "#EC4899", // pink-600
            "#F59E0B", // amber-500
            "#06B6D4", // cyan-500
          ].slice(0, sortedCategories.length),
          borderWidth: 1,
        },
      ],
    };
  };

  // Konfiguracja opcji wykresu kołowego
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: darkMode ? "#fff" : "#333",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${formatNumber(value)} PLN`;
          },
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-green-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 text-red-200 border border-red-700 p-4 rounded-lg mb-6 flex items-center">
        <FaExclamationTriangle className="text-red-400 mr-2 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <FaChartLine className="text-green-400 mr-3" />
          <span className="relative">
            Pulpit
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-transparent"></span>
          </span>
        </h1>
        <Link to="/transactions/new" className="btn-primary">
          <FaExchangeAlt className="mr-2" /> Nowa transakcja
        </Link>
      </div>

      {/* Statystyki */}
      <DashboardStats stats={stats} />

      {/* Wykresy transakcji */}
      <DashboardCharts transactions={transactions} />

      {/* Wykresy przychodów i wydatków według kategorii */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wykres przychodów według kategorii */}
        <div className="animated-card bg-gray-800/30 border border-gray-700/40 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FaChartPie className="text-green-400 mr-2" />
            <span>Przychody według kategorii</span>
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-green-400 text-3xl" />
            </div>
          ) : Object.keys(categoryIncome).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FaChartPie className="text-gray-500 text-4xl mb-3" />
              <p>Brak danych o przychodach</p>
            </div>
          ) : (
            <div className="h-64">
              <Pie data={prepareIncomePieData()} options={pieOptions} />
            </div>
          )}
        </div>

        {/* Wykres wydatków według kategorii */}
        <div className="animated-card bg-gray-800/30 border border-gray-700/40 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FaChartPie className="text-green-400 mr-2" />
            <span>Wydatki według kategorii</span>
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-green-400 text-3xl" />
            </div>
          ) : Object.keys(categorySpending).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FaChartPie className="text-gray-500 text-4xl mb-3" />
              <p>Brak danych o wydatkach</p>
            </div>
          ) : (
            <div className="h-64">
              <Pie data={prepareExpensePieData()} options={pieOptions} />
            </div>
          )}
        </div>
      </div>

      {/* Ostatnie transakcje */}
      <div className="bg-gray-800/30 border border-gray-700/40 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <FaWallet className="text-green-400 mr-3" /> Ostatnie transakcje
        </h2>
        <RecentTransactions
          transactions={transactions.slice(0, 5)}
          loading={isLoading}
          error={error}
        />
      </div>

      {/* Szybkie akcje - karty */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/transactions/new"
          className="animated-card bg-gradient-to-br from-green-400/70 to-cyan-500/70 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
        >
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-full mr-4">
              <FaPlus className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold">
                Dodaj transakcję
              </h3>
              <p className="text-white/80 text-sm">
                Zapisz nowy przychód lub wydatek
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <span className="text-white/80 flex items-center text-sm font-medium">
              Dodaj teraz <FaArrowRight className="ml-2" />
            </span>
          </div>
        </Link>

        <Link
          to="/budget"
          className="animated-card bg-gradient-to-br from-purple-500/70 to-indigo-600/70 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
        >
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-full mr-4">
              <FaChartPie className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold">
                Zarządzaj budżetem
              </h3>
              <p className="text-white/80 text-sm">
                Sprawdź i ustaw limity wydatków
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <span className="text-white/80 flex items-center text-sm font-medium">
              Przejdź do budżetu <FaArrowRight className="ml-2" />
            </span>
          </div>
        </Link>

        <Link
          to="/transactions"
          className="animated-card bg-gradient-to-br from-amber-500/70 to-orange-600/70 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
        >
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-full mr-4">
              <FaWallet className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold">
                Historia transakcji
              </h3>
              <p className="text-white/80 text-sm">
                Przeglądaj wszystkie operacje
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <span className="text-white/80 flex items-center text-sm font-medium">
              Zobacz historię <FaArrowRight className="ml-2" />
            </span>
          </div>
        </Link>
      </div>

      {/* Nowa sekcja - Przypomnienia o płatnościach */}
      <div className="animated-card bg-gray-800/30 rounded-lg border border-gray-700/40 overflow-hidden shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FaCalendarAlt className="text-green-400 mr-3" />
            <span>Przypomnienia o płatnościach</span>
          </h2>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-medium text-white">
                  Synchronizacja z Google Calendar
                </h3>
                <p className="text-gray-400 mt-1">
                  Połącz swoje przypomnienia o płatnościach z kalendarzem Google
                  aby nie przegapić terminów
                </p>
              </div>

              {!googleCalendarLinked ? (
                <button
                  onClick={handleGoogleCalendarSync}
                  disabled={authorizingGoogle}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center"
                >
                  {authorizingGoogle ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Łączenie...
                    </>
                  ) : (
                    <>
                      <FaGoogle className="mr-2" />
                      Połącz z kalendarzem
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center px-4 py-2 bg-green-900/30 border border-green-700/50 rounded-lg text-green-400">
                  <FaCheck className="mr-2" />
                  Połączono z Google Calendar
                </div>
              )}
            </div>

            {calendarMessage && (
              <div className="mt-4 px-4 py-3 bg-green-900/30 border border-green-700/50 rounded-lg text-green-400">
                {calendarMessage}
              </div>
            )}
          </div>

          {/* Przykładowe zbliżające się płatności */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-3 flex items-center">
              <FaBell className="text-green-400 mr-2" />
              Zbliżające się płatności
            </h3>

            <div className="space-y-3">
              <div className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center border border-gray-700/30">
                <div>
                  <span className="text-white font-medium">Czynsz</span>
                  <div className="text-gray-400 text-sm mt-1">10.04.2025</div>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-medium">1200 PLN</span>
                  <div className="text-gray-400 text-sm mt-1">Za 5 dni</div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center border border-gray-700/30">
                <div>
                  <span className="text-white font-medium">Netflix</span>
                  <div className="text-gray-400 text-sm mt-1">15.04.2025</div>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-medium">45 PLN</span>
                  <div className="text-gray-400 text-sm mt-1">Za 10 dni</div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center border border-gray-700/30">
                <div>
                  <span className="text-white font-medium">Ubezpieczenie</span>
                  <div className="text-gray-400 text-sm mt-1">20.04.2025</div>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-medium">320 PLN</span>
                  <div className="text-gray-400 text-sm mt-1">Za 15 dni</div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center mx-auto">
                <FaCalendarAlt className="mr-2" />
                Zobacz wszystkie płatności
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMain;
