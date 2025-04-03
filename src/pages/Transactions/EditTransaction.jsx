import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaSave,
  FaTimes,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaTag,
  FaFileAlt,
  FaSpinner,
} from "react-icons/fa";
import { getCategoriesByType } from "../../utils/transactionCategories";

const EditTransaction = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [originalTransaction, setOriginalTransaction] = useState(null);

  // Pobieranie danych transakcji do edycji
  useEffect(() => {
    const fetchTransaction = async () => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, "transactions", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Sprawdzenie, czy użytkownik ma uprawnienia do edycji tej transakcji
          if (data.userId !== currentUser.uid) {
            setError("Nie masz uprawnień do edycji tej transakcji");
            setTimeout(() => navigate("/transactions"), 3000);
            return;
          }

          // Konwersja daty z Firestore
          const transactionDate =
            data.date instanceof Timestamp
              ? data.date.toDate()
              : new Date(data.date);

          // Zapisanie oryginalnej transakcji do późniejszego porównania
          setOriginalTransaction(data);

          // Wypełnienie formularza danymi
          setTitle(data.title || "");
          setAmount(data.amount || "");
          setType(data.type || "expense");
          setCategory(data.category || "");
          setDate(transactionDate.toISOString().split("T")[0]);
          setNote(data.note || "");
        } else {
          setError("Nie znaleziono transakcji o podanym ID");
          setTimeout(() => navigate("/transactions"), 3000);
        }
      } catch (err) {
        console.error("Błąd podczas pobierania transakcji:", err);
        setError("Wystąpił błąd podczas ładowania danych transakcji");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, currentUser, navigate]);

  // Obsługa zmiany typu transakcji
  const handleTypeChange = (newType) => {
    setType(newType);
    // Resetuj kategorię jeśli nie jest kompatybilna z nowym typem
    if (category && !getCategoriesByType(newType).includes(category)) {
      setCategory("");
    }
  };

  // Walidacja formularza
  const validateForm = () => {
    if (!title.trim()) {
      setError("Tytuł jest wymagany");
      return false;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Kwota musi być liczbą większą od zera");
      return false;
    }

    if (!category) {
      setError("Kategoria jest wymagana");
      return false;
    }

    if (!date) {
      setError("Data jest wymagana");
      return false;
    }

    return true;
  };

  // Obsługa zapisu zmian
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Przygotowanie danych do aktualizacji
      const transactionData = {
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        category,
        date: Timestamp.fromDate(new Date(date)),
        note: note.trim(),
        updatedAt: Timestamp.now(),
      };

      // Aktualizacja dokumentu w Firestore
      const docRef = doc(db, "transactions", id);
      await updateDoc(docRef, transactionData);

      // Wyświetlenie komunikatu o sukcesie
      setSuccess("Transakcja została zaktualizowana pomyślnie!");

      // Przekierowanie po krótkim opóźnieniu
      setTimeout(() => {
        navigate("/transactions");
      }, 1500);
    } catch (err) {
      console.error("Błąd podczas aktualizacji transakcji:", err);
      setError("Nie udało się zaktualizować transakcji: " + err.message);
      setSubmitting(false);
    }
  };

  // Anulowanie edycji
  const handleCancel = () => {
    navigate("/transactions");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center">
        <FaMoneyBillWave className="text-green-400 mr-3" />
        <span className="relative">
          Edytuj transakcję
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-transparent"></span>
        </span>
      </h1>

      {error && (
        <div
          className="bg-red-900/30 text-red-200 border border-red-700 px-4 py-3 rounded-lg relative animate-[fade-in_0.3s_ease-out_forwards]"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-900/30 text-green-200 border border-green-700 px-4 py-3 rounded-lg relative animate-[fade-in_0.3s_ease-out_forwards]"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="glow-border">
        <div className="animated-card bg-gray-800/90">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    <FaFileAlt className="inline-block mr-2 text-green-400" />
                    Tytuł
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
                    placeholder="Np. Zakupy spożywcze, Wypłata"
                    disabled={submitting}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    <FaMoneyBillWave className="inline-block mr-2 text-green-400" />
                    Kwota
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0.01"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
                    placeholder="0.00"
                    disabled={submitting}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Typ
                  </label>
                  <div className="mt-1 flex space-x-4">
                    <label className="relative flex items-center bg-gray-700 rounded-lg px-4 py-2 cursor-pointer border border-gray-600 transition-all duration-300 hover:border-green-400/50">
                      <input
                        type="radio"
                        value="expense"
                        checked={type === "expense"}
                        onChange={() => handleTypeChange("expense")}
                        className="hidden"
                        disabled={submitting}
                      />
                      <span
                        className={`w-4 h-4 mr-2 rounded-full ${type === "expense" ? "bg-red-400" : "bg-gray-500"}`}
                      ></span>
                      <span className="text-sm text-white">Wydatek</span>
                    </label>
                    <label className="relative flex items-center bg-gray-700 rounded-lg px-4 py-2 cursor-pointer border border-gray-600 transition-all duration-300 hover:border-green-400/50">
                      <input
                        type="radio"
                        value="income"
                        checked={type === "income"}
                        onChange={() => handleTypeChange("income")}
                        className="hidden"
                        disabled={submitting}
                      />
                      <span
                        className={`w-4 h-4 mr-2 rounded-full ${type === "income" ? "bg-green-400" : "bg-gray-500"}`}
                      ></span>
                      <span className="text-sm text-white">Przychód</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    <FaTag className="inline-block mr-2 text-green-400" />
                    Kategoria
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
                    disabled={submitting}
                    required
                  >
                    <option value="">Wybierz kategorię</option>
                    {getCategoriesByType(type).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

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
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="note"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    <FaFileAlt className="inline-block mr-2 text-green-400" />
                    Notatka (opcjonalnie)
                  </label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
                    rows="3"
                    placeholder="Dodatkowe informacje o transakcji..."
                    disabled={submitting}
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center"
                  disabled={submitting}
                >
                  <FaTimes className="mr-2" />
                  Anuluj
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Zapisz zmiany
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTransaction;
