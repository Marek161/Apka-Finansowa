import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { FaPlus, FaChartPie, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { fetchUserTransactions } from "../../store/transactionsSlice";
import { formatCurrency, formatDate } from "../../utils/formatters";

// Tymczasowy komponent wykresu kołowego - w rzeczywistej aplikacji użylibyśmy biblioteki Chart.js lub Recharts
const PieChart = () => (
  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="text-gray-500 dark:text-gray-400">
        Wykres kołowy kategorii wydatków
      </div>
      <div className="mt-2 text-sm text-gray-400 dark:text-gray-500">
        Wizualizacja zostanie dodana wkrótce
      </div>
    </div>
  </div>
);

// Tymczasowy komponent wykresu liniowego
const LineChart = () => (
  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="text-gray-500 dark:text-gray-400">
        Wykres liniowy zmian salda
      </div>
      <div className="mt-2 text-sm text-gray-400 dark:text-gray-500">
        Wizualizacja zostanie dodana wkrótce
      </div>
    </div>
  </div>
);

// Główny komponent pulpitu
const Dashboard = () => {
  const dispatch = useDispatch();
  const { items: transactions, status } = useSelector(
    (state) => state.transactions
  );
  const { user } = useSelector((state) => state.auth);

  // Pobieranie transakcji użytkownika przy pierwszym renderowaniu
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUserTransactions(user?.id || "user_1"));
    }
  }, [status, dispatch, user]);

  // Obliczanie salda
  const balance = transactions.reduce((acc, transaction) => {
    return transaction.type === "income"
      ? acc + transaction.amount
      : acc - transaction.amount;
  }, 0);

  // Obliczanie wykorzystania budżetu (przykładowa wartość - w rzeczywistej aplikacji bazowałoby to na rzeczywistych danych)
  const budgetUsage = 65; // Procent

  // Pobranie ostatnich transakcji
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Pulpit
        </h1>

        {/* Podsumowanie finansowe */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Karta salda */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Aktualne saldo
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(balance, user?.currency || "PLN")}
              </dd>
            </div>
          </div>

          {/* Karta wykorzystania budżetu */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Wykorzystanie budżetu
              </dt>
              <dd className="mt-1">
                <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {budgetUsage}%
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                  <div
                    className={`h-2.5 rounded-full ${
                      budgetUsage > 90
                        ? "bg-red-600"
                        : budgetUsage > 75
                          ? "bg-yellow-500"
                          : "bg-green-600"
                    }`}
                    style={{ width: `${budgetUsage}%` }}
                  ></div>
                </div>
              </dd>
            </div>
          </div>

          {/* Karta szybkich akcji */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg sm:col-span-2 lg:col-span-1">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Szybkie akcje
              </dt>
              <dd className="mt-3 flex space-x-3">
                <Link
                  to="/transactions/add"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center"
                >
                  <FaPlus className="mr-2" /> Dodaj transakcję
                </Link>
                <Link
                  to="/budget"
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center"
                >
                  <FaChartPie className="mr-2" /> Ustaw budżet
                </Link>
              </dd>
            </div>
          </div>
        </div>

        {/* Sekcja ostatnich transakcji */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Ostatnie transakcje
          </h2>
          <div className="mt-4 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <li key={transaction.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                              transaction.type === "income"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <FaArrowUp />
                            ) : (
                              <FaArrowDown />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {transaction.category.charAt(0).toUpperCase() +
                                transaction.category.slice(1)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(transaction.date)}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}{" "}
                          {formatCurrency(
                            transaction.amount,
                            user?.currency || "PLN"
                          )}
                        </div>
                      </div>
                      {transaction.notes && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {transaction.notes}
                        </div>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-5 sm:px-6 text-center text-gray-500 dark:text-gray-400">
                  Brak transakcji. Dodaj swoją pierwszą transakcję!
                </li>
              )}
            </ul>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 text-right sm:px-6">
              <Link
                to="/transactions/history"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
              >
                Zobacz wszystkie transakcje →
              </Link>
            </div>
          </div>
        </div>

        {/* Sekcja wykresów */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Podział wydatków
            </h2>
            <PieChart />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Zmiana salda
            </h2>
            <LineChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
