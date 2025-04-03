import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBudget } from "../../contexts/BudgetContext";
import { TRANSACTION_CATEGORIES } from "../../utils/transactionCategories";
import { FaSave, FaTimes } from "react-icons/fa";

const BudgetForm = () => {
  const navigate = useNavigate();
  const { budgetId } = useParams();
  const { addBudget, updateBudget, getBudgetDetails } = useBudget();

  // Stan formularza
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    currency: "PLN",
    period: "monthly",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Pobieranie danych budżetu do edycji
  useEffect(() => {
    if (budgetId) {
      setIsEditing(true);
      setLoading(true);
      getBudgetDetails(budgetId)
        .then((budget) => {
          setFormData({
            category: budget.category,
            amount: budget.amount.toString(),
            currency: budget.currency,
            period: budget.period,
          });
        })
        .catch((error) => {
          setError("Nie udało się pobrać danych budżetu");
          console.error("Błąd podczas pobierania budżetu:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [budgetId, getBudgetDetails]);

  // Obsługa zmiany pól formularza
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Walidacja formularza
  const validateForm = () => {
    if (!formData.category) {
      setError("Wybierz kategorię");
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Wprowadź prawidłową kwotę");
      return false;
    }
    return true;
  };

  // Obsługa wysyłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (isEditing) {
        await updateBudget(budgetId, budgetData);
      } else {
        await addBudget(budgetData);
      }

      navigate("/budgets");
    } catch (error) {
      setError(
        isEditing
          ? "Nie udało się zaktualizować budżetu"
          : "Nie udało się dodać budżetu"
      );
      console.error("Błąd podczas zapisywania budżetu:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/30 rounded-lg border border-gray-700/40 p-6">
          <h1 className="text-2xl font-bold text-white mb-6">
            {isEditing ? "Edytuj budżet" : "Dodaj nowy budżet"}
          </h1>

          {error && (
            <div className="bg-red-900/30 text-red-200 border border-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kategoria */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kategoria
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-gray-700/50 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Wybierz kategorię</option>
                {TRANSACTION_CATEGORIES.expense.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Kwota */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kwota
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full bg-gray-700/50 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
              />
            </div>

            {/* Waluta */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Waluta
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full bg-gray-700/50 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="PLN">PLN</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            {/* Okres */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Okres budżetowy
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="period"
                    value="monthly"
                    checked={formData.period === "monthly"}
                    onChange={handleChange}
                    className="form-radio text-green-500 focus:ring-green-500 h-4 w-4"
                  />
                  <span className="ml-2 text-gray-300">Miesięczny</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="period"
                    value="yearly"
                    checked={formData.period === "yearly"}
                    onChange={handleChange}
                    className="form-radio text-green-500 focus:ring-green-500 h-4 w-4"
                  />
                  <span className="ml-2 text-gray-300">Roczny</span>
                </label>
              </div>
            </div>

            {/* Przyciski */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/budgets")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <FaTimes className="mr-2" />
                Anuluj
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <FaSave className="mr-2" />
                {isEditing ? "Zapisz zmiany" : "Dodaj budżet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetForm;
