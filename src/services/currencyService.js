// Serwis do konwersji walut
const API_KEY = "YOUR_API_KEY"; // Zastąp swoim kluczem API z exchangerate-api.com lub podobnego serwisu
const BASE_URL = "https://v6.exchangerate-api.com/v6/";

// Pobieranie aktualnych kursów walut
export const fetchExchangeRates = async (baseCurrency = "PLN") => {
  try {
    const response = await fetch(
      `${BASE_URL}${API_KEY}/latest/${baseCurrency}`
    );
    const data = await response.json();

    if (data.result === "success") {
      return data.conversion_rates;
    } else {
      throw new Error("Nie udało się pobrać kursów walut");
    }
  } catch (error) {
    console.error("Błąd podczas pobierania kursów walut:", error);
    // Zwrócenie domyślnych kursów jako zabezpieczenie
    return {
      PLN: 1,
      EUR: 0.22,
      USD: 0.25,
      GBP: 0.19,
    };
  }
};

// API do obsługi kursów walut
// Korzystamy z darmowego API NBP (Narodowy Bank Polski)

/**
 * Pobiera aktualny kurs waluty w stosunku do PLN
 * @param {string} currency - Kod waluty (EUR, USD, GBP, CHF)
 * @returns {Promise<number>} Kurs wymiany waluty
 */
export const getExchangeRate = async (currency) => {
  if (currency === "PLN") return 1; // PLN to PLN zawsze 1:1

  try {
    // API NBP - np. dla EUR: https://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json
    const response = await fetch(
      `https://api.nbp.pl/api/exchangerates/rates/a/${currency.toLowerCase()}/?format=json`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Błąd pobierania kursu waluty: ${response.statusText}`);
    }

    const data = await response.json();
    // API zwraca tablicę rates, bierzemy najnowszy kurs
    return data.rates[0].mid;
  } catch (error) {
    console.error("Błąd podczas pobierania kursu waluty:", error);
    // W przypadku błędu zwracamy domyślne kursy (przybliżone)
    const defaultRates = {
      EUR: 4.32,
      USD: 3.95,
      GBP: 5.05,
      CHF: 4.5,
    };
    return defaultRates[currency] || 1;
  }
};

/**
 * Konwertuje kwotę z jednej waluty na drugą
 * @param {number} amount - Kwota do przeliczenia
 * @param {string} fromCurrency - Waluta źródłowa
 * @param {string} toCurrency - Waluta docelowa
 * @returns {Promise<number>} Przeliczona kwota
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) return amount;

    const fromRate = await getExchangeRate(fromCurrency);
    const toRate = await getExchangeRate(toCurrency);

    // Najpierw konwertujemy na PLN (jeśli nie jest już w PLN), a potem na walutę docelową
    const amountInPLN = fromCurrency === "PLN" ? amount : amount * fromRate;
    const convertedAmount =
      toCurrency === "PLN" ? amountInPLN : amountInPLN / toRate;

    return convertedAmount;
  } catch (error) {
    console.error("Błąd podczas konwersji waluty:", error);
    return amount; // W przypadku błędu zwracamy oryginalną kwotę
  }
};

/**
 * Formatuje kwotę z określoną walutą
 * @param {number} amount - Kwota do sformatowania
 * @param {string} currency - Kod waluty
 * @returns {string} Sformatowana kwota z symbolem waluty
 */
export const formatCurrency = (amount, currency = "PLN") => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Pobiera dostępne waluty
 * @returns {Array} Lista dostępnych walut
 */
export const getAvailableCurrencies = () => {
  return [
    { code: "PLN", name: "Polski złoty", symbol: "zł" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "USD", name: "Dolar amerykański", symbol: "$" },
    { code: "GBP", name: "Funt brytyjski", symbol: "£" },
    { code: "CHF", name: "Frank szwajcarski", symbol: "CHF" },
  ];
};
