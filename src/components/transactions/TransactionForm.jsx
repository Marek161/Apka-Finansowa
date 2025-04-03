import React, { useState, useEffect } from "react";
import { FaSave, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addTransaction } from "../../store/transactionsSlice";
import { formatCurrency } from "../../utils/formatters";
import { saveTransaction } from "../../services/transactionService";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  TRANSACTION_CATEGORIES,
  getCategoriesByType,
} from "../../utils/transactionCategories";

// Komponent formularza do dodawania nowych transakcji
const TransactionForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Pobieranie funkcji dispatch i danych użytkownika ze store
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Stan formularza z domyślnymi wartościami
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    category: "",
    type: "expense",
    note: "",
  });

  // Stan przechowujący błędy walidacji
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchTransaction = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const docRef = doc(db, "transactions", id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const date =
              data.date instanceof Timestamp
                ? data.date.toDate()
                : new Date(data.date);

            setFormData({
              title: data.title || "",
              amount: data.amount || "",
              date: date.toISOString().slice(0, 10),
              category: data.category || "",
              type: data.type || "expense",
              note: data.note || "",
            });
          } else {
            setError("Nie znaleziono transakcji.");
            setTimeout(() => navigate("/transactions"), 3000);
          }
        } catch (err) {
          console.error("Error fetching transaction:", err);
          setError("Wystąpił błąd podczas pobierania danych transakcji.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTransaction();
  }, [id, isEditMode, navigate]);

  // Obsługa zmiany wartości w polach formularza
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Jeśli zmieniamy typ transakcji, a kategoria nie pasuje do nowego typu, resetujemy kategorię
    if (
      name === "type" &&
      formData.category &&
      !getCategoriesByType(value).includes(formData.category)
    ) {
      setFormData({
        ...formData,
        [name]: value,
        category: "", // Resetujemy kategorię
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Usuwamy błąd dla tego pola po zmianie
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  // Walidacja formularza
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Tytuł jest wymagany";
    }

    if (!formData.amount) {
      errors.amount = "Kwota jest wymagana";
    } else if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      errors.amount = "Kwota musi być dodatnią liczbą";
    }

    if (!formData.date) {
      errors.date = "Data jest wymagana";
    }

    if (!formData.category) {
      errors.category = "Kategoria jest wymagana";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Obsługa wysłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentUser) {
      setError("Musisz być zalogowany aby dodać transakcję.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const transactionData = {
        title: formData.title.trim(),
        amount: Number(formData.amount),
        date: new Date(formData.date),
        category: formData.category,
        type: formData.type,
        note: formData.note.trim(),
        userId: currentUser.uid,
        createdAt: new Date(),
      };

      if (isEditMode) {
        // Aktualizacja istniejącej transakcji
        const docRef = doc(db, "transactions", id);
        await updateDoc(docRef, {
          ...transactionData,
          updatedAt: new Date(),
        });
        setSuccessMessage("Transakcja została zaktualizowana pomyślnie!");
      } else {
        // Dodawanie nowej transakcji
        const docRef = await addDoc(
          collection(db, "transactions"),
          transactionData
        );
        setSuccessMessage("Transakcja została dodana pomyślnie!");

        // Resetujemy formularz po dodaniu
        setFormData({
          title: "",
          amount: "",
          date: new Date().toISOString().slice(0, 10),
          category: "",
          type: "expense",
          note: "",
        });
      }

      // Przekierowanie po krótkim opóźnieniu
      setTimeout(() => {
        navigate("/transactions");
      }, 2000);
    } catch (err) {
      console.error("Error saving transaction:", err);
      setError(
        "Wystąpił błąd podczas zapisywania transakcji. Spróbuj ponownie później."
      );
    } finally {
      setLoading(false);
    }
  };

  // Lista dostępnych kategorii na podstawie wybranego typu transakcji
  const availableCategories = getCategoriesByType(formData.type);

  return (
    <div className="bg-gray-800/30 border border-gray-700/40 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-white mb-6">
        {isEditMode ? "Edytuj transakcję" : "Dodaj nową transakcję"}
      </h2>

      {error && (
        <div className="bg-red-900/30 text-red-200 border border-red-700/50 p-4 rounded-lg mb-6 flex items-center">
          <FaExclamationTriangle className="text-red-400 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-900/30 text-green-200 border border-green-700/50 p-4 rounded-lg mb-6">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Tytuł transakcji */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Tytuł transakcji
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${
                formErrors.title ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="np. Zakupy spożywcze"
              disabled={loading}
            />
            {formErrors.title && (
              <p className="mt-1 text-sm text-red-400">{formErrors.title}</p>
            )}
          </div>

          {/* Kwota */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Kwota (PLN)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`form-input ${
                formErrors.amount ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={loading}
            />
            {formErrors.amount && (
              <p className="mt-1 text-sm text-red-400">{formErrors.amount}</p>
            )}
          </div>

          {/* Data */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Data
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`form-input ${
                formErrors.date ? "border-red-500" : "border-gray-600"
              }`}
              disabled={loading}
            />
            {formErrors.date && (
              <p className="mt-1 text-sm text-red-400">{formErrors.date}</p>
            )}
          </div>

          {/* Typ transakcji */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Typ transakcji
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center justify-center py-2 px-4 border rounded-md cursor-pointer transition-colors ${
                  formData.type === "income"
                    ? "bg-green-500/20 border-green-500 text-green-400"
                    : "bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === "income"}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={loading}
                />
                <span>Przychód</span>
              </label>
              <label
                className={`flex items-center justify-center py-2 px-4 border rounded-md cursor-pointer transition-colors ${
                  formData.type === "expense"
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : "bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === "expense"}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={loading}
                />
                <span>Wydatek</span>
              </label>
            </div>
          </div>

          {/* Kategoria */}
          <div className="md:col-span-2">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Kategoria
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`form-select ${
                formErrors.category ? "border-red-500" : "border-gray-600"
              }`}
              disabled={loading}
            >
              <option value="">Wybierz kategorię</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <p className="mt-1 text-sm text-red-400">{formErrors.category}</p>
            )}
          </div>

          {/* Notatka */}
          <div className="md:col-span-2">
            <label
              htmlFor="note"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Notatka (opcjonalnie)
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows="3"
              className="form-textarea"
              placeholder="Dodatkowe informacje o transakcji..."
              disabled={loading}
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                <span>Zapisywanie...</span>
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                <span>Zapisz transakcję</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
