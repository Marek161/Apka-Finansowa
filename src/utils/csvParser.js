// Funkcja do parsowania plików CSV z transakcjami
export const parseCSV = (csvData) => {
  // Podział na linie i usunięcie pustych linii
  const lines = csvData.split("\n").filter((line) => line.trim());

  // Pobranie nagłówków z pierwszej linii
  const headers = lines[0].split(",").map((header) => header.trim());

  // Mapowanie nazw kolumn na pola w bazie danych
  const columnMapping = {
    Data: "date",
    Kwota: "amount",
    Kategoria: "category",
    Typ: "type",
    Notatki: "notes",
  };

  // Parsowanie każdej linii danych
  const transactions = lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    const transaction = {};

    // Mapowanie wartości na odpowiednie pola
    headers.forEach((header, index) => {
      const fieldName = columnMapping[header];
      if (fieldName) {
        transaction[fieldName] = values[index];
      }
    });

    // Konwersja daty na format ISO
    if (transaction.date) {
      const [day, month, year] = transaction.date.split(".");
      transaction.date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    // Konwersja kwoty na liczbę
    if (transaction.amount) {
      transaction.amount = parseFloat(transaction.amount.replace(",", "."));
    }

    // Konwersja typu transakcji
    if (transaction.type) {
      transaction.type =
        transaction.type.toLowerCase() === "przychód" ? "income" : "expense";
    }

    // Dodanie dodatkowych pól
    transaction.id = `csv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    transaction.createdAt = new Date().toISOString();

    return transaction;
  });

  // Filtrowanie nieprawidłowych transakcji
  return transactions.filter((transaction) => {
    return (
      transaction.date &&
      !isNaN(transaction.amount) &&
      transaction.category &&
      transaction.type
    );
  });
};
