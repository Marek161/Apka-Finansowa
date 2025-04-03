import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

// Utworzenie kontekstu budżetu
const BudgetContext = createContext();

// Hook ułatwiający dostęp do kontekstu budżetu
export function useBudget() {
  return useContext(BudgetContext);
}

// Provider kontekstu budżetu
export function BudgetProvider({ children }) {
  // Stany komponentu
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [indexError, setIndexError] = useState(null);
  const { currentUser } = useAuth();

  // Efekt pobierający dane budżetów z Firestore
  useEffect(() => {
    if (!currentUser) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setIndexError(null);

    try {
      // Tworzenie zapytania do kolekcji budżetów
      const budgetQuery = query(
        collection(db, "budgets"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );

      // Subskrypcja do zmian w kolekcji budżetów
      const unsubscribe = onSnapshot(
        budgetQuery,
        (snapshot) => {
          const budgetList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setBudgets(budgetList);
          setLoading(false);
        },
        (error) => {
          console.error("Błąd podczas pobierania budżetów:", error);

          // Sprawdzenie czy błąd dotyczy brakującego indeksu
          if (
            error.code === "failed-precondition" &&
            error.message.includes("index")
          ) {
            // Wyciągnięcie URL do utworzenia indeksu
            const indexUrlMatch = error.message.match(
              /https:\/\/console\.firebase\.google\.com[^\s"]*/
            );
            if (indexUrlMatch) {
              setIndexError({
                message: "Brakujący indeks Firebase",
                indexUrl: indexUrlMatch[0],
              });
            } else {
              setError(
                "Brakujący indeks Firebase. Sprawdź konsolę przeglądarki."
              );
            }
          } else {
            setError("Nie udało się pobrać budżetów");
          }

          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Błąd podczas konfiguracji zapytania:", error);
      setError("Wystąpił błąd podczas ładowania budżetów");
      setLoading(false);
    }
  }, [currentUser]);

  // Funkcja dodająca nowy budżet
  const addBudget = async (budgetData) => {
    if (!currentUser) throw new Error("Użytkownik nie jest zalogowany");

    try {
      const newBudget = {
        ...budgetData,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "budgets"), newBudget);
      return { id: docRef.id, ...newBudget };
    } catch (error) {
      console.error("Błąd podczas dodawania budżetu:", error);
      throw new Error("Nie udało się dodać budżetu");
    }
  };

  // Funkcja aktualizująca budżet
  const updateBudget = async (budgetId, budgetData) => {
    if (!currentUser) throw new Error("Użytkownik nie jest zalogowany");

    try {
      const budgetRef = doc(db, "budgets", budgetId);
      const updateData = {
        ...budgetData,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(budgetRef, updateData);
      return { id: budgetId, ...updateData };
    } catch (error) {
      console.error("Błąd podczas aktualizacji budżetu:", error);
      throw new Error("Nie udało się zaktualizować budżetu");
    }
  };

  // Funkcja usuwająca budżet
  const deleteBudget = async (budgetId) => {
    if (!currentUser) throw new Error("Użytkownik nie jest zalogowany");

    try {
      await deleteDoc(doc(db, "budgets", budgetId));
    } catch (error) {
      console.error("Błąd podczas usuwania budżetu:", error);
      throw new Error("Nie udało się usunąć budżetu");
    }
  };

  // Funkcja pobierająca szczegóły budżetu
  const getBudgetDetails = async (budgetId) => {
    if (!currentUser) throw new Error("Użytkownik nie jest zalogowany");

    try {
      const budgetRef = doc(db, "budgets", budgetId);
      const budgetSnap = await getDocs(budgetRef);

      if (budgetSnap.exists()) {
        const budgetData = budgetSnap.data();
        // Sprawdzenie czy użytkownik ma dostęp do tego budżetu
        if (budgetData.userId !== currentUser.uid) {
          throw new Error("Brak dostępu do tego budżetu");
        }
        return { id: budgetSnap.id, ...budgetData };
      } else {
        throw new Error("Budżet nie istnieje");
      }
    } catch (error) {
      console.error("Błąd podczas pobierania szczegółów budżetu:", error);
      throw new Error("Nie udało się pobrać szczegółów budżetu");
    }
  };

  // Funkcja obliczająca wykorzystanie budżetu
  const calculateBudgetUsage = async (budgetId) => {
    if (!currentUser) throw new Error("Użytkownik nie jest zalogowany");

    try {
      // Pobierz budżet
      const budget = await getBudgetDetails(budgetId);

      // Pobierz transakcje dla danej kategorii
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("userId", "==", currentUser.uid),
        where("category", "==", budget.category),
        where("type", "==", "expense")
      );

      const querySnapshot = await getDocs(transactionsQuery);
      const totalSpent = querySnapshot.docs.reduce(
        (sum, doc) => sum + doc.data().amount,
        0
      );

      return {
        budgetAmount: budget.amount,
        spent: totalSpent,
        remaining: budget.amount - totalSpent,
        percentage: (totalSpent / budget.amount) * 100,
      };
    } catch (error) {
      console.error("Błąd podczas obliczania wykorzystania budżetu:", error);
      throw new Error("Nie udało się obliczyć wykorzystania budżetu");
    }
  };

  // Wartość kontekstu
  const value = {
    budgets,
    loading,
    error,
    indexError,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetDetails,
    calculateBudgetUsage,
  };

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}
