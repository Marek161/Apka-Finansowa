// Ten serwis obsługuje wszystkie wywołania API związane z transakcjami
// Możesz zastąpić go implementacją Firebase, Supabase lub innego backendu

// Pobieranie wszystkich transakcji dla użytkownika
export const fetchTransactions = async (userId) => {
  try {
    // Przykładowa implementacja dla Firebase
    // const snapshot = await firebase.firestore().collection('transactions')
    //   .where('userId', '==', userId)
    //   .orderBy('date', 'desc')
    //   .get();

    // return snapshot.docs.map(doc => ({
    //   id: doc.id,
    //   ...doc.data()
    // }));

    // Na razie zwracamy przykładowe dane
    return mockTransactions.filter(
      (transaction) => transaction.userId === userId
    );
  } catch (error) {
    console.error("Błąd podczas pobierania transakcji:", error);
    throw error;
  }
};

// Zapisywanie nowej transakcji
export const saveTransaction = async (transactionData) => {
  try {
    // Przykładowa implementacja dla Firebase
    // const docRef = await firebase.firestore().collection('transactions').add(transactionData);
    // return {
    //   id: docRef.id,
    //   ...transactionData
    // };

    // Na razie zwracamy przykładowe dane z wygenerowanym ID
    const newTransaction = {
      id: "transaction_" + Date.now(),
      ...transactionData,
    };
    mockTransactions.push(newTransaction);
    return newTransaction;
  } catch (error) {
    console.error("Błąd podczas zapisywania transakcji:", error);
    throw error;
  }
};

// Usuwanie transakcji
export const deleteTransaction = async (transactionId) => {
  try {
    // Przykładowa implementacja dla Firebase
    // await firebase.firestore().collection('transactions').doc(transactionId).delete();

    // Na razie aktualizujemy przykładowe dane
    const index = mockTransactions.findIndex((t) => t.id === transactionId);
    if (index !== -1) {
      mockTransactions.splice(index, 1);
    }
    return transactionId;
  } catch (error) {
    console.error("Błąd podczas usuwania transakcji:", error);
    throw error;
  }
};

// Przykładowe dane do celów rozwojowych
const mockTransactions = [
  {
    id: "transaction_1",
    userId: "user_1",
    amount: 125.5,
    category: "food",
    date: "2023-05-15",
    type: "expense",
    notes: "Zakupy spożywcze",
  },
  {
    id: "transaction_2",
    userId: "user_1",
    amount: 45.0,
    category: "transport",
    date: "2023-05-14",
    type: "expense",
    notes: "Bilet miesięczny",
  },
  {
    id: "transaction_3",
    userId: "user_1",
    amount: 3500.0,
    category: "salary",
    date: "2023-05-12",
    type: "income",
    notes: "Wypłata",
  },
];
