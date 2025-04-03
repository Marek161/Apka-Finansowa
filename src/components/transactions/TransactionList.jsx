// Komponent wyświetlający listę transakcji użytkownika z możliwością filtrowania
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";

const TransactionList = ({ filter = {} }) => {
  // Stan przechowujący listę transakcji
  const [transactions, setTransactions] = useState([]);
  // Stan kontrolujący stan ładowania
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Efekt pobierający transakcje przy zmianie użytkownika lub filtrów
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Podstawowe zapytanie pobierające transakcje użytkownika
        let transactionsQuery = query(
          collection(db, "transactions"),
          where("userId", "==", currentUser.uid),
          orderBy("date", "desc"),
          limit(50)
        );

        // Dodawanie dodatkowych filtrów do zapytania
        if (filter.startDate) {
          transactionsQuery = query(
            transactionsQuery,
            where("date", ">=", filter.startDate)
          );
        }

        if (filter.endDate) {
          transactionsQuery = query(
            transactionsQuery,
            where("date", "<=", filter.endDate)
          );
        }

        if (filter.category) {
          transactionsQuery = query(
            transactionsQuery,
            where("category", "==", filter.category)
          );
        }

        if (filter.type) {
          transactionsQuery = query(
            transactionsQuery,
            where("type", "==", filter.type)
          );
        }

        // Pobieranie i przetwarzanie transakcji
        const querySnapshot = await getDocs(transactionsQuery);
        const transactionsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTransactions(transactionsList);
      } catch (error) {
        console.error("Błąd podczas pobierania transakcji:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchTransactions();
    }
  }, [currentUser, filter]);

  // Wyświetlanie stanu ładowania
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Wyświetlanie komunikatu gdy nie ma transakcji
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">Nie masz jeszcze żadnych transakcji.</p>
      </div>
    );
  }

  // Tabela z listą transakcji
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Nagłówek tabeli */}
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Data
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Kategoria
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Opis
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Kwota
            </th>
          </tr>
        </thead>
        {/* Zawartość tabeli */}
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(transaction.date).toLocaleDateString("pl-PL")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.notes || "-"}
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {transaction.amount} {transaction.currency || "PLN"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
