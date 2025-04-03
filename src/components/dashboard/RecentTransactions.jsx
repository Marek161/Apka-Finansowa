import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

// Komponent wyświetlający listę ostatnich transakcji
const RecentTransactions = () => {
  // Przykładowe dane - w rzeczywistej aplikacji będą pobierane z Redux
  const transactions = [
    {
      id: 1,
      date: "2023-05-15",
      category: "Żywność",
      amount: -125.5,
      type: "expense",
      notes: "Zakupy spożywcze",
    },
    {
      id: 2,
      date: "2023-05-14",
      category: "Transport",
      amount: -45.0,
      type: "expense",
      notes: "Bilet miesięczny",
    },
    {
      id: 3,
      date: "2023-05-12",
      category: "Wynagrodzenie",
      amount: 3500.0,
      type: "income",
      notes: "Wypłata",
    },
    {
      id: 4,
      date: "2023-05-10",
      category: "Rozrywka",
      amount: -89.99,
      type: "expense",
      notes: "Kino",
    },
    {
      id: 5,
      date: "2023-05-08",
      category: "Zdrowie",
      amount: -200.0,
      type: "expense",
      notes: "Wizyta u lekarza",
    },
  ];

  return (
    <div className="flow-root">
      {/* Lista transakcji z separatorami */}
      <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="py-4">
            <div className="flex items-center space-x-4">
              {/* Ikona typu transakcji (przychód/wydatek) */}
              <div
                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  transaction.type === "income"
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-red-100 dark:bg-red-900"
                }`}
              >
                {transaction.type === "income" ? (
                  <FaArrowUp className="h-4 w-4 text-green-500 dark:text-green-400" />
                ) : (
                  <FaArrowDown className="h-4 w-4 text-red-500 dark:text-red-400" />
                )}
              </div>
              {/* Informacje o transakcji (kategoria i data) */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {transaction.category}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {new Date(transaction.date).toLocaleDateString("pl-PL")}
                </p>
              </div>
              {/* Kwota transakcji */}
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.type === "income"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {transaction.amount.toLocaleString("pl-PL", {
                    style: "currency",
                    currency: "PLN",
                  })}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentTransactions;
