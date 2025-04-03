import React, { useState } from "react";
import { useBudget } from "../../contexts/BudgetContext";
import { FaPlus, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";

const BudgetList = () => {
  const { budgets, loading, error, deleteBudget, calculateBudgetUsage } =
    useBudget();
  const [budgetUsage, setBudgetUsage] = useState({});
  const [loadingUsage, setLoadingUsage] = useState({});
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Funkcja do pobierania wykorzystania budżetu
  const fetchBudgetUsage = async (budgetId) => {
    if (loadingUsage[budgetId]) return;

    setLoadingUsage((prev) => ({ ...prev, [budgetId]: true }));
    try {
      const usage = await calculateBudgetUsage(budgetId);
      setBudgetUsage((prev) => ({ ...prev, [budgetId]: usage }));
    } catch (error) {
      console.error("Błąd podczas pobierania wykorzystania budżetu:", error);
    } finally {
      setLoadingUsage((prev) => ({ ...prev, [budgetId]: false }));
    }
  };

  // Funkcja do usuwania budżetu
  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten budżet?")) return;

    try {
      await deleteBudget(budgetId);
      setSuccessMessage("Budżet został pomyślnie usunięty");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setDeleteError("Nie udało się usunąć budżetu");
      setTimeout(() => setDeleteError(""), 3000);
    }
  };

  // Funkcja pomocnicza do wyświetlania paska postępu
  const renderProgressBar = (usage) => {
    const percentage = usage?.percentage || 0;
    const barColor =
      percentage >= 90
        ? "bg-red-500"
        : percentage >= 75
          ? "bg-yellow-500"
          : "bg-green-500";

    return (
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className={`${barColor} h-2.5 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <FaSpinner className="animate-spin text-4xl text-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 text-red-200 border border-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Nagłówek */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Budżety</h1>
        <Link
          to="/budgets/new"
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          Dodaj budżet
        </Link>
      </div>

      {/* Komunikaty */}
      {successMessage && (
        <div className="bg-green-900/30 text-green-200 border border-green-700 p-4 rounded-lg mb-4">
          {successMessage}
        </div>
      )}

      {deleteError && (
        <div className="bg-red-900/30 text-red-200 border border-red-700 p-4 rounded-lg mb-4">
          {deleteError}
        </div>
      )}

      {/* Lista budżetów */}
      {budgets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">
            Nie masz jeszcze żadnych budżetów
          </p>
          <Link
            to="/budgets/new"
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            Utwórz pierwszy budżet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const usage = budgetUsage[budget.id];

            return (
              <div
                key={budget.id}
                className="bg-gray-800/30 rounded-lg border border-gray-700/40 p-6 hover:border-gray-600/40 transition-colors"
                onMouseEnter={() => !usage && fetchBudgetUsage(budget.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {budget.category}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {budget.period === "monthly" ? "Miesięczny" : "Roczny"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/budgets/edit/${budget.id}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl font-bold text-white">
                      {budget.amount.toFixed(2)} {budget.currency}
                    </span>
                    {usage && (
                      <span className="text-sm text-gray-400">
                        Wykorzystano: {usage.percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  {loadingUsage[budget.id] ? (
                    <div className="flex justify-center">
                      <FaSpinner className="animate-spin text-green-500" />
                    </div>
                  ) : (
                    usage && renderProgressBar(usage)
                  )}
                </div>

                {usage && (
                  <div className="text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Wydano:</span>
                      <span className="text-white">
                        {usage.spent.toFixed(2)} {budget.currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Pozostało:</span>
                      <span
                        className={`font-medium ${usage.remaining >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {usage.remaining.toFixed(2)} {budget.currency}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetList;
