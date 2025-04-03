import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave, FaSpinner, FaWallet } from "react-icons/fa";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { getCategoriesWithDetails } from "../../utils/transactionCategories";

const NewBudget = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
  });

  // Pobieramy kategorie wydatków
  const expenseCategories = getCategoriesWithDetails("expense");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formData.name) {
      setError("Nazwa budżetu jest wymagana.");
      return;
    }

    if (
      !formData.amount ||
      isNaN(Number(formData.amount)) ||
      Number(formData.amount) <= 0
    ) {
      setError("Kwota budżetu musi być liczbą większą od zera.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const newBudget = {
        name: formData.name,
        amount: Number(formData.amount),
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, "budgets"), newBudget);
      navigate("/budget");
    } catch (error) {
      console.error("Błąd podczas zapisywania budżetu:", error);
      setError("Nie udało się zapisać budżetu. Spróbuj ponownie później.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/budget")}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Powrót do budżetu
          </button>
          <h1 className="text-2xl font-semibold text-white flex items-center">
            <FaWallet className="text-green-400 mr-3" />
            Nowy budżet
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 text-red-200 rounded-lg border border-red-700">
            {error}
          </div>
        )}

        <div className="bg-gray-800/30 rounded-lg border border-gray-700/40 overflow-hidden shadow-xl">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Nazwa (kategoria)
                </label>
                <select
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  required
                >
                  <option value="">Wybierz kategorię...</option>
                  {expenseCategories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Kwota budżetu (PLN)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-400 to-cyan-500 rounded-lg text-white shadow-lg hover:from-green-500 hover:to-cyan-600 transition-all duration-300 flex items-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Zapisz budżet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewBudget;
