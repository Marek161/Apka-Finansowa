import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaChartPie,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useBudget } from "../contexts/BudgetContext";
import FirebaseIndexHelper from "../components/FirebaseIndexHelper";
import { getCategoriesWithDetails } from "../utils/transactionCategories";

const Budget = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const { budgets, loading, indexError, deleteBudget } = useBudget();
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [userCurrency, setUserCurrency] = useState("PLN");

  const expenseCategories = getCategoriesWithDetails("expense");

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const savedSettings = localStorage.getItem("userSettings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.currency) {
            setUserCurrency(settings.currency);
          }
        }
      } catch (error) {
        console.error("Błąd podczas pobierania ustawień użytkownika:", error);
      }
    };

    fetchUserSettings();
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoadingTransactions(true);
      const transactionsRef = collection(db, "transactions");
      const q = query(
        transactionsRef,
        where("userId", "==", currentUser.uid),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(transactions);
    } catch (error) {
      console.error("Błąd podczas pobierania transakcji:", error);
      setError("Nie udało się pobrać transakcji. Spróbuj ponownie później.");
    } finally {
      setLoadingTransactions(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten budżet?")) return;

    try {
      await deleteBudget(id);
    } catch (error) {
      console.error("Błąd podczas usuwania budżetu:", error);
      setError("Nie udało się usunąć budżetu. Spróbuj ponownie później.");
    }
  };

  const calculateBudgetUsage = (budgetCategory) => {
    const relevantTransactions = transactions.filter(
      (transaction) => transaction.category === budgetCategory
    );

    return relevantTransactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
  };

  const calculateBudgetPercentage = (budgetCategory, budgetAmount) => {
    const spent = calculateBudgetUsage(budgetCategory);
    return Math.round((spent / budgetAmount) * 100);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: userCurrency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-green-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white flex items-center">
          <FaChartPie className="text-green-400 mr-3" />
          <span>Budżet</span>
        </h1>
        <button
          onClick={() => navigate("/budget/new")}
          className="px-4 py-2 bg-gradient-to-r from-green-400 to-cyan-500 rounded-lg text-white shadow-lg hover:from-green-500 hover:to-cyan-600 transition-all duration-300 flex items-center"
        >
          <FaPlus className="mr-2" />
          Dodaj budżet
        </button>
      </div>

      {indexError && <FirebaseIndexHelper indexUrl={indexError.indexUrl} />}

      {error && (
        <div className="bg-red-800/30 border border-red-600/50 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-3xl text-green-400" />
          </div>
        ) : budgets.length === 0 && !indexError ? (
          <div className="col-span-full min-h-[300px] flex flex-col items-center justify-center bg-gray-800/30 rounded-lg border border-gray-700/40">
            <FaChartPie className="text-green-400 text-4xl mb-4 animate-pulse" />
            <p className="text-gray-400 text-center mb-4">
              Nie masz jeszcze żadnych budżetów
            </p>
            <button
              onClick={() => navigate("/budget/new")}
              className="px-4 py-2 bg-gradient-to-r from-green-400 to-cyan-500 rounded-lg text-white shadow-lg hover:from-green-500 hover:to-cyan-600 transition-all duration-300 flex items-center"
            >
              <FaPlus className="mr-2" />
              Utwórz pierwszy budżet
            </button>
          </div>
        ) : (
          budgets.map((budget, index) => (
            <div
              key={budget.id}
              className="animated-card bg-gray-800/90"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-5 relative overflow-hidden">
                <h3 className="text-xl font-medium text-white mb-4 truncate">
                  {budget.name}
                </h3>

                <div className="mb-4">
                  <p className="text-gray-400 mb-1 text-sm">Limit budżetu</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(budget.amount)}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <p className="text-gray-400 text-sm">Wykorzystano</p>
                    <p className="text-sm font-medium text-white">
                      {formatCurrency(calculateBudgetUsage(budget.name))} /{" "}
                      {formatCurrency(budget.amount)}
                    </p>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        calculateBudgetUsage(budget.name) > budget.amount * 0.9
                          ? "bg-red-500"
                          : calculateBudgetUsage(budget.name) >
                              budget.amount * 0.7
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          (calculateBudgetUsage(budget.name) / budget.amount) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium ${
                      calculateBudgetUsage(budget.name) > budget.amount
                        ? "text-red-500"
                        : calculateBudgetUsage(budget.name) >
                            budget.amount * 0.9
                          ? "text-yellow-500"
                          : "text-green-500"
                    }`}
                  >
                    {calculateBudgetPercentage(budget.name, budget.amount)}%
                    wykorzystano
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/budget/edit/${budget.id}`)}
                      className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Budget;
