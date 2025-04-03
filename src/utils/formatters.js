// Formatowanie waluty zgodnie z lokalizacją i preferencjami użytkownika
export const formatCurrency = (amount, currency = "PLN", locale = "pl-PL") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Formatowanie daty do czytelnego formatu
export const formatDate = (dateString, locale = "pl-PL") => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Formatowanie wartości procentowej
export const formatPercentage = (value, locale = "pl-PL") => {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

// Pobieranie nazwy miesiąca
export const getMonthName = (monthNumber, locale = "pl-PL") => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString(locale, { month: "long" });
};
