// Komponent do dzielenia wydatków między użytkownikami
import React, { useState, useEffect } from "react";
import { FaUsers, FaPlus, FaTrash } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const SharedExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    participants: [],
    description: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { currentUser } = useAuth();

  // Pobieranie wspólnych wydatków
  useEffect(() => {
    const fetchSharedExpenses = async () => {
      if (!currentUser) return;

      try {
        const expensesRef = collection(db, "sharedExpenses");
        const q = query(
          expensesRef,
          where("participants", "array-contains", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const expensesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setExpenses(expensesList);
      } catch (error) {
        console.error("Błąd podczas pobierania wspólnych wydatków:", error);
        setError("Wystąpił błąd podczas pobierania wydatków");
      }
    };

    fetchSharedExpenses();
  }, [currentUser]);

  // Obsługa dodawania nowego wydatku
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setError(null);
    setSuccess(false);

    try {
      const expenseData = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        participants: [...newExpense.participants, currentUser.uid],
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      await addDoc(collection(db, "sharedExpenses"), expenseData);

      // Odświeżenie listy wydatków
      const expensesRef = collection(db, "sharedExpenses");
      const q = query(
        expensesRef,
        where("participants", "array-contains", currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const expensesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setExpenses(expensesList);
      setNewExpense({
        title: "",
        amount: "",
        participants: [],
        description: "",
      });
      setSuccess(true);
    } catch (error) {
      console.error("Błąd podczas dodawania wydatku:", error);
      setError("Wystąpił błąd podczas dodawania wydatku");
    }
  };

  // Obsługa usuwania wydatku
  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteDoc(doc(db, "sharedExpenses", expenseId));

      // Odświeżenie listy wydatków
      setExpenses(expenses.filter((expense) => expense.id !== expenseId));
      setSuccess(true);
    } catch (error) {
      console.error("Błąd podczas usuwania wydatku:", error);
      setError("Wystąpił błąd podczas usuwania wydatku");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Wspólne wydatki
      </h2>

      {/* Formularz dodawania nowego wydatku */}
      <form onSubmit={handleAddExpense} className="mb-6 space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Tytuł
          </label>
          <input
            type="text"
            id="title"
            value={newExpense.title}
            onChange={(e) =>
              setNewExpense({ ...newExpense, title: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Kwota
          </label>
          <input
            type="number"
            id="amount"
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({ ...newExpense, amount: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Opis
          </label>
          <textarea
            id="description"
            value={newExpense.description}
            onChange={(e) =>
              setNewExpense({ ...newExpense, description: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
            rows="3"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <FaPlus className="mr-2" />
          Dodaj wydatek
        </button>
      </form>

      {/* Lista wspólnych wydatków */}
      <div className="space-y-4">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {expense.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {expense.description}
              </p>
              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FaUsers className="mr-1" />
                {expense.participants.length} uczestników
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {expense.amount.toFixed(2)} PLN
              </span>
              <button
                onClick={() => handleDeleteExpense(expense.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}

        {expenses.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Brak wspólnych wydatków
          </p>
        )}
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 text-sm text-green-600 dark:text-green-400">
          Operacja zakończona pomyślnie!
        </div>
      )}
    </div>
  );
};

export default SharedExpenses;
