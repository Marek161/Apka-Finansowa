// Komponent wyświetlający listę ostatnich transakcji użytkownika
import React from "react";
import { Link } from "react-router-dom";
import { FaArrowUp, FaArrowDown, FaEye } from "react-icons/fa";

const RecentTransactions = ({ transactions = [], loading = false }) => {
  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "Nieprawidłowa data";
    }
    return date.toLocaleDateString("pl-PL");
  };

  return (
    <div className="w-full overflow-x-auto">
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-400"></div>
          <span className="ml-3 text-gray-400">Ładowanie transakcji...</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-gray-400 mb-4">Brak ostatnich transakcji</p>
          <Link
            to="/transactions/new"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-cyan-500 text-white shadow-lg hover:from-green-500 hover:to-cyan-600 transition-all duration-300"
          >
            Dodaj nową transakcję
          </Link>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-700/40">
          <thead className="bg-gray-900/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Data
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Tytuł
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Kategoria
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Kwota
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
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-gray-700/30 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {transaction.title || "Bez tytułu"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {transaction.category || "Bez kategorii"}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                    transaction.type === "income"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  <div className="flex items-center justify-end">
                    {transaction.type === "income" ? (
                      <FaArrowUp className="mr-2" />
                    ) : (
                      <FaArrowDown className="mr-2" />
                    )}
                    {transaction.type === "income" ? "+" : "-"}
                    {Number(transaction.amount).toFixed(2)} PLN
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/transactions`}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                  >
                    <FaEye />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 text-center">
        <Link
          to="/transactions"
          className="text-sm text-green-400 hover:text-green-300 transition-colors duration-200"
        >
          Zobacz wszystkie transakcje →
        </Link>
      </div>
    </div>
  );
};

export default RecentTransactions;
