# Instrukcja dla deweloperów - Aplikacja Finansowa

## Spis treści

1. [Wprowadzenie](#wprowadzenie)
2. [Technologie](#technologie)
3. [Struktura projektu](#struktura-projektu)
4. [Konfiguracja środowiska](#konfiguracja-środowiska)
5. [Architektura aplikacji](#architektura-aplikacji)
6. [Styl kodu i standardy](#styl-kodu-i-standardy)
7. [Zarządzanie stanem](#zarządzanie-stanem)
8. [Testy](#testy)
9. [CI/CD](#cicd)
10. [Proces rozwoju funkcjonalności](#proces-rozwoju-funkcjonalności)

## Wprowadzenie

Aplikacja Finansowa to aplikacja internetowa do zarządzania osobistymi finansami, oparta o React z wykorzystaniem Firebase jako backendu. Ten dokument zawiera wszystkie niezbędne informacje dla deweloperów pracujących nad projektem.

## Technologie

### Frontend

- **React** - biblioteka JavaScript do budowania interfejsów użytkownika
- **React Router** - zarządzanie routingiem w aplikacji
- **Redux** - zarządzanie globalnym stanem aplikacji
- **Context API** - lżejsze zarządzanie stanem dla określonych funkcjonalności
- **Tailwind CSS** - framework CSS do stylowania komponentów
- **React Icons** - biblioteka ikon
- **Recharts** - biblioteka do tworzenia wykresów
- **React Hook Form** - zarządzanie formularzami

### Backend

- **Firebase** - platforma BaaS (Backend as a Service)
  - Firestore - baza danych NoSQL
  - Authentication - uwierzytelnianie użytkowników
  - Storage - przechowywanie plików
  - Hosting - hosting aplikacji
  - Functions - funkcje serverless

### Narzędzia

- **Craco** - konfiguracja Create React App bez ejekcji
- **ESLint** - statyczna analiza kodu
- **Prettier** - formatowanie kodu
- **Jest** - framework testowy
- **React Testing Library** - testowanie komponentów
- **GitHub Actions** - CI/CD

## Struktura projektu

```
/src
  /api               # Moduły komunikacji z API
  /components        # Komponenty wielokrotnego użytku
    /common          # Wspólne komponenty (przyciski, pola formularzy itp.)
    /layout          # Komponenty layoutu (nagłówek, menu boczne itp.)
    /charts          # Komponenty wykresów
    /transactions    # Komponenty związane z transakcjami
    /budget          # Komponenty związane z budżetem
  /contexts          # Konteksty Reacta
  /features          # Funkcjonalności aplikacji
  /hooks             # Niestandardowe hooki
  /pages             # Komponenty stron
  /services          # Serwisy aplikacji
  /store             # Konfiguracja Redux
    /slices          # Reducery i akcje Redux
  /styles            # Style globalne
  /utils             # Funkcje pomocnicze
```

## Konfiguracja środowiska

### Wymagania

- Node.js v16 lub nowszy
- npm v8 lub nowszy
- Konto Firebase

### Instalacja lokalna

1. Sklonuj repozytorium:

   ```bash
   git clone https://github.com/twoj-username/aplikacja-finansowa.git
   cd aplikacja-finansowa
   ```

2. Zainstaluj zależności:

   ```bash
   npm install
   ```

3. Utwórz plik `.env.local` w katalogu głównym projektu i dodaj klucze konfiguracyjne Firebase:

   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Uruchom aplikację w trybie deweloperskim:
   ```bash
   npm start
   ```

## Architektura aplikacji

### Zarządzanie stanem

- **Redux** dla globalnego stanu aplikacji (transakcje, budżety)
- **Context API** dla stanu kontekstowego (autoryzacja, motywy)
- **React Query** dla zapytań do API i cachingu danych
- **Local/Session Storage** dla trwałych preferencji użytkownika

### Struktura routingu

- Publiczne ścieżki (logowanie, rejestracja)
- Chronione ścieżki (pulpit, transakcje, budżet, ustawienia)
- Zarządzanie ścieżkami przez React Router

### Komunikacja z backendem

- Obsługa zapytań poprzez dedykowane serwisy API w katalogu `/api`
- Wykorzystanie Firebase SDK do interakcji z Firestore i Authentication
- Centralne zarządzanie błędami i notyfikacjami

## Styl kodu i standardy

### Konwencje nazewnicze

- **Pliki komponentów**: PascalCase z rozszerzeniem .jsx
- **Pliki niebędące komponentami**: camelCase z rozszerzeniem .js
- **Komponenty funkcyjne**: preferowane zamiast komponentów klasowych
- **Stylowanie**: klasy Tailwind bezpośrednio w komponentach

### Formatowanie kodu

- Używamy Prettier do formatowania kodu
- ESLint do statycznej analizy kodu
- Konfiguracja w plikach .prettierrc i .eslintrc

### Struktura komponentu

```jsx
// Importy zewnętrznych bibliotek
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Importy lokalnych komponentów i pomocników
import { someHelper } from "../utils/helpers";
import SubComponent from "./SubComponent";

// Definicja komponentu
const ExampleComponent = ({ prop1, prop2 }) => {
  // Hooki
  const [state, setState] = useState(initialState);

  // Efekty
  useEffect(() => {
    // Logika
  }, [dependencies]);

  // Handlery
  const handleClick = () => {
    // Logika
  };

  // Renderowanie warunkowe
  if (someCondition) {
    return <div>Alternative render</div>;
  }

  // Główny render
  return (
    <div className="component-wrapper">
      <h2>{prop1}</h2>
      <SubComponent data={prop2} onClick={handleClick} />
    </div>
  );
};

// PropTypes
ExampleComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.object,
};

// Eksport
export default ExampleComponent;
```

## Zarządzanie stanem

### Redux

Redux stosujemy do zarządzania globalnym stanem aplikacji, głównie dla danych transakcji i budżetu.

```javascript
// Przykład slice'a Redux
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchTransactions } from "../api/transactionApi";

export const getTransactions = createAsyncThunk(
  "transactions/getTransactions",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetchTransactions(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    // Reducery
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransactions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default transactionsSlice.reducer;
```

### Context API

Context API stosujemy do zarządzania stanem tematycznym.

```javascript
// Przykład kontekstu dla zarządzania motywem
import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") === "dark";
    setDarkMode(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

## Testy

### Testy jednostkowe

Używamy Jest do testów jednostkowych dla funkcji pomocniczych i serwisów.

```javascript
// Przykład testu jednostkowego
import { formatCurrency } from "../utils/currencyFormatter";

describe("Currency Formatter", () => {
  test("formats currency correctly", () => {
    expect(formatCurrency(1234.56, "PLN")).toBe("1 234,56 zł");
    expect(formatCurrency(1000, "USD")).toBe("$1,000.00");
  });
});
```

### Testy komponentów

Używamy React Testing Library do testowania komponentów.

```javascript
// Przykład testu komponentu
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../components/common/Button";

describe("Button Component", () => {
  test("renders correctly", () => {
    render(<Button label="Test Button" />);
    expect(screen.getByText("Test Button")).toBeInTheDocument();
  });

  test("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button label="Click Me" onClick={handleClick} />);
    fireEvent.click(screen.getByText("Click Me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## CI/CD

Używamy GitHub Actions do automatyzacji procesów CI/CD.

Workflow obejmuje:

1. Uruchamianie testów
2. Lint kodu
3. Build aplikacji
4. Deploy na Firebase Hosting

## Proces rozwoju funkcjonalności

1. **Przygotowanie**: Analiza wymagań i planowanie
2. **Implementacja**: Pisanie kodu zgodnie z wytycznymi
3. **Testowanie**: Pisanie testów i manualne testowanie
4. **Review**: Code review przez innych deweloperów
5. **Integracja**: Merge do głównej gałęzi
6. **Deploy**: Wdrożenie na środowisko produkcyjne

### Tworzenie nowej funkcjonalności

1. Utwórz nową gałąź z głównej gałęzi (develop):

   ```bash
   git checkout -b feature/nazwa-funkcjonalnosci
   ```

2. Implementuj funkcjonalność zgodnie z wymaganiami

3. Testuj zmiany lokalnie:

   ```bash
   npm test
   npm run lint
   ```

4. Wypchnij zmiany do repozytorium:

   ```bash
   git push origin feature/nazwa-funkcjonalnosci
   ```

5. Utwórz Pull Request do gałęzi develop

6. Po zatwierdzeniu przez review, zmerguj zmiany
