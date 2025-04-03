/**
 * Standardowe kategorie transakcji używane w aplikacji
 */
export const TRANSACTION_CATEGORIES = {
  income: [
    "Wynagrodzenie",
    "Premia",
    "Inwestycje",
    "Odsetki bankowe",
    "Zwrot podatku",
    "Prezent",
    "Sprzedaż",
    "Inna kategoria przychodu",
  ],
  expense: [
    "Mieszkanie",
    "Media",
    "Żywność",
    "Transport",
    "Samochód",
    "Rozrywka",
    "Restauracje",
    "Odzież i obuwie",
    "Zdrowie",
    "Higiena i kosmetyki",
    "Edukacja",
    "Prezenty i pomoc",
    "Subskrypcje i abonamenty",
    "Elektronika",
    "Hobby i sport",
    "Wakacje i podróże",
    "Podatki i opłaty urzędowe",
    "Rata kredytu/pożyczki",
    "Inna kategoria wydatku",
  ],
};

/**
 * Funkcja zwracająca kategorie z pełnymi szczegółami (id i nazwa)
 * @param {string} type - Typ transakcji ("income" lub "expense")
 * @returns {Array} - Lista kategorii z id i nazwami
 */
export const getCategoriesWithDetails = (type) => {
  const categories =
    type === "income"
      ? TRANSACTION_CATEGORIES.income
      : TRANSACTION_CATEGORIES.expense;

  return categories.map((category) => ({
    id: category, // używamy nazwy jako id
    name: category,
  }));
};

/**
 * Funkcja zwracająca wszystkie kategorie jako jedną listę z pełnymi szczegółami
 * @returns {Array} - Lista wszystkich kategorii z id i nazwami
 */
export const getAllCategoriesWithDetails = () => {
  return [
    ...getCategoriesWithDetails("income"),
    ...getCategoriesWithDetails("expense"),
  ];
};

/**
 * Funkcja zwracająca wszystkie kategorie jako jedną listę
 */
export const getAllCategories = () => {
  return [...TRANSACTION_CATEGORIES.income, ...TRANSACTION_CATEGORIES.expense];
};

/**
 * Funkcja zwracająca kategorie transakcji dla danego typu
 * @param {string} type - Typ transakcji ("income" lub "expense")
 * @returns {Array} - Lista kategorii dla danego typu
 */
export const getCategoriesByType = (type) => {
  if (type === "income") {
    return TRANSACTION_CATEGORIES.income;
  } else if (type === "expense") {
    return TRANSACTION_CATEGORIES.expense;
  }
  return [];
};

/**
 * Funkcja sprawdzająca czy dana kategoria jest przychodem
 * @param {string} category - Kategoria do sprawdzenia
 * @returns {boolean} - Czy kategoria jest przychodem
 */
export const isIncomeCategory = (category) => {
  return TRANSACTION_CATEGORIES.income.includes(category);
};

/**
 * Funkcja sprawdzająca czy dana kategoria jest wydatkiem
 * @param {string} category - Kategoria do sprawdzenia
 * @returns {boolean} - Czy kategoria jest wydatkiem
 */
export const isExpenseCategory = (category) => {
  return TRANSACTION_CATEGORIES.expense.includes(category);
};
