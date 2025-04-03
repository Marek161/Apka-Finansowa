import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useBudget } from "../../contexts/BudgetContext";
import {
  FaSave,
  FaTimes,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaTag,
  FaFileAlt,
  FaArrowLeft,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { getCategoriesWithDetails } from "../../utils/transactionCategories";

const NewTransaction = () => {
  // Inicjalizacja hooków i kontekstów
  const { currentUser } = useAuth();
  const { budgets } = useBudget();
  const navigate = useNavigate();

  // Stany komponentu
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userCurrency, setUserCurrency] = useState("PLN");

  // Stan formularza z domyślnymi wartościami
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Stany dla zarządzania potwierdzeniem i wydatkami
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [categorySpending, setCategorySpending] = useState({});

  // Hook efektu do pobierania ustawień użytkownika z localStorage
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

  // Pobranie list kategorii dla przychodów i wydatków
  const incomeCategories = getCategoriesWithDetails("income");
  const expenseCategories = getCategoriesWithDetails("expense");

  // Hook efektu do monitorowania i obliczania wydatków w kategorii
  useEffect(() => {
    const fetchCategorySpending = async () => {
      if (!currentUser || formData.type !== "expense" || !formData.category)
        return;

      try {
        // Pobranie transakcji dla wybranej kategorii
        const transactionsRef = collection(db, "transactions");
        const q = query(
          transactionsRef,
          where("userId", "==", currentUser.uid),
          where("type", "==", "expense"),
          where("category", "==", formData.category)
        );
        const querySnapshot = await getDocs(q);

        // Obliczenie sumy wydatków w kategorii
        const totalSpent = querySnapshot.docs.reduce(
          (sum, doc) => sum + doc.data().amount,
          0
        );

        // Aktualizacja stanu wydatków
        setCategorySpending({
          ...categorySpending,
          [formData.category]: totalSpent,
        });

        // Sprawdzenie przekroczenia budżetu
        const categoryBudget = budgets.find(
          (b) => b.name === formData.category
        );
        if (categoryBudget) {
          const newTotal = totalSpent + parseFloat(formData.amount);
          if (newTotal > categoryBudget.amount) {
            setWarning(
              `Uwaga! Dodanie tej transakcji spowoduje przekroczenie budżetu dla kategorii "${formData.category}". ` +
                `Budżet: ${categoryBudget.amount.toFixed(2)} PLN, ` +
                `Aktualne wydatki: ${totalSpent.toFixed(2)} PLN, ` +
                `Po dodaniu: ${newTotal.toFixed(2)} PLN`
            );
          } else {
            setWarning("");
          }
        }
      } catch (error) {
        console.error("Błąd podczas pobierania wydatków:", error);
      }
    };

    fetchCategorySpending();
  }, [currentUser, formData.type, formData.category, formData.amount, budgets]);

  // Obsługa wysłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Walidacja wymaganych pól
    if (!formData.amount || !formData.category || !formData.date) {
      setError("Proszę wypełnić wszystkie wymagane pola");
      return;
    }

    // Walidacja poprawności kwoty
    if (
      isNaN(parseFloat(formData.amount)) ||
      parseFloat(formData.amount) <= 0
    ) {
      setError("Kwota musi być liczbą większą od zera");
      return;
    }

    // Sprawdzenie czy wymagane jest potwierdzenie przekroczenia budżetu
    if (warning && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Przygotowanie danych transakcji do zapisania
      const transactionData = {
        userId: currentUser.uid,
        title: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: Timestamp.fromDate(new Date(formData.date)),
        note: "",
        currency: userCurrency,
        createdAt: Timestamp.now(),
      };

      // Dodanie transakcji do bazy danych
      const docRef = await addDoc(
        collection(db, "transactions"),
        transactionData
      );

      // Obsługa sukcesu
      if (docRef.id) {
        setSuccessMessage("Transakcja została pomyślnie dodana!");

        // Reset formularza do wartości początkowych
        setFormData({
          type: "expense",
          amount: "",
          category: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
        });

        // Przekierowanie do listy transakcji po krótkim opóźnieniu
        setTimeout(() => {
          navigate("/transactions");
        }, 1500);
      }
    } catch (error) {
      console.error("Błąd podczas dodawania transakcji:", error);
      setError("Nie udało się dodać transakcji: " + error.message);
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  // Renderowanie interfejsu użytkownika
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Nagłówek z przyciskiem powrotu */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/transactions")}
            className="text-gray-400 hover:text-white mr-4"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-white">Nowa transakcja</h1>
        </div>

        {/* Wyświetlanie komunikatów błędów */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 text-red-200 rounded-lg border border-red-700">
            {error}
          </div>
        )}

        {/* Wyświetlanie ostrzeżeń o przekroczeniu budżetu */}
        {warning && (
          <div className="mb-6 p-4 bg-yellow-900/30 text-yellow-200 rounded-lg border border-yellow-700 flex items-start">
            <FaExclamationTriangle className="text-yellow-400 mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Ostrzeżenie o przekroczeniu budżetu</p>
              <p className="text-sm">{warning}</p>
              {showConfirmation && (
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Tak, dodaj mimo to
                  </button>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Anuluj
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wyświetlanie komunikatu sukcesu */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/30 text-green-200 rounded-lg border border-green-700">
            {successMessage}
          </div>
        )}

        {/* Formularz dodawania transakcji */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pole wyboru typu transakcji */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Typ transakcji
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              required
            >
              <option value="expense">Wydatek</option>
              <option value="income">Przychód</option>
            </select>
          </div>

          {/* Pole wyboru kategorii */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Kategoria
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              required
            >
              <option value="">Wybierz kategorię...</option>
              {/* Dynamiczne renderowanie opcji kategorii w zależności od typu transakcji */}
              {formData.type === "income"
                ? incomeCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))
                : expenseCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
            </select>
          </div>

          {/* Sekcja z polami kwoty i daty */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Pole kwoty transakcji */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                <FaMoneyBillWave className="inline-block mr-2 text-green-400" />
                Kwota ({userCurrency})
              </label>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                step="0.01"
                min="0.01"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
                placeholder="0.00"
                required
              />
            </div>

            {/* Pole daty transakcji */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                <FaCalendarAlt className="inline-block mr-2 text-green-400" />
                Data
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
          </div>

          {/* Pole opisu transakcji */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              <FaFileAlt className="inline-block mr-2 text-green-400" />
              Opis
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="3"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
              placeholder="Dodatkowe informacje o transakcji..."
              required
            ></textarea>
          </div>

          {/* Przyciski akcji formularza */}
          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-cyan-500 text-white shadow-lg hover:from-green-500 hover:to-cyan-600 transition-all duration-300"
            >
              <FaSave className="mr-2" />{" "}
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                "Dodaj transakcję"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTransaction;
