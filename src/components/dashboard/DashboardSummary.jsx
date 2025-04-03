import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

// Komponent wyświetlający podsumowanie na pulpicie
const DashboardSummary = () => {
  // Przykładowe dane - w rzeczywistej aplikacji będą pobierane z Redux
  const balance = 3750.45;
  const budgetUsage = 65; // procent

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sekcja salda */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Aktualne saldo
          </h2>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
            {balance.toLocaleString("pl-PL", {
              style: "currency",
              currency: "PLN",
            })}
          </p>
          {/* Informacja o zmianie salda */}
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <FaArrowUp className="mr-1" />
              12%
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">
              w porównaniu do poprzedniego miesiąca
            </span>
          </div>
        </div>

        {/* Sekcja wykorzystania budżetu */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Wykorzystanie budżetu
          </h2>
          <div className="mt-1 relative pt-1">
            {/* Pasek postępu wykorzystania budżetu */}
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200 dark:bg-indigo-900">
              <div
                style={{ width: `${budgetUsage}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  budgetUsage > 90
                    ? "bg-red-500"
                    : budgetUsage > 75
                      ? "bg-yellow-500"
                      : "bg-indigo-500"
                }`}
              ></div>
            </div>
            {/* Procentowe wskaźniki wykorzystania */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-400">
                  {budgetUsage}% wykorzystano
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-400">
                  {100 - budgetUsage}% pozostało
                </span>
              </div>
            </div>
          </div>
          {/* Status wykorzystania budżetu */}
          <div className="mt-2 flex items-center text-sm">
            <span
              className={`flex items-center ${budgetUsage > 90 ? "text-red-500" : budgetUsage > 75 ? "text-yellow-500" : "text-green-500"}`}
            >
              {budgetUsage > 90 ? (
                <>
                  <FaArrowUp className="mr-1" />
                  Przekroczono budżet!
                </>
              ) : budgetUsage > 75 ? (
                <>
                  <FaArrowUp className="mr-1" />
                  Zbliżasz się do limitu
                </>
              ) : (
                <>
                  <FaArrowDown className="mr-1" />W granicach budżetu
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
