# 🟢 Aplikacja Finansowa

Aplikacja Finansowa to nowoczesne narzędzie do zarządzania osobistymi finansami, zbudowane przy użyciu React i Firebase. Aplikacja umożliwia śledzenie przychodów i wydatków, zarządzanie budżetem oraz wizualizację danych finansowych.

## 🟢 Spis treści

1. [Wprowadzenie](#wprowadzenie)
2. [Rejestracja i logowanie](#rejestracja-i-logowanie)
3. [Pulpit główny](#pulpit-główny)
4. [Zarządzanie transakcjami](#zarządzanie-transakcjami)
5. [Zarządzanie budżetem](#zarządzanie-budżetem)
6. [Ustawienia aplikacji](#ustawienia-aplikacji)
7. [Eksport danych](#eksport-danych)
8. [Rozwiązywanie problemów](#rozwiązywanie-problemów)

## 🟢 Funkcjonalności

- Autoryzacja użytkowników
- Zarządzanie transakcjami (dodawanie, edytowanie, usuwanie)
- Konfiguracja budżetu
- Wizualizacja danych w postaci wykresów
- Synchronizacja w czasie rzeczywistym
- Obsługa offline

## 🟢 Technologie

- React 18
- Firebase (Firestore, Authentication, Storage)
- Tailwind CSS
- Redux
- Context API
- React Router
- Chart.js / Recharts
- Jest & React Testing Library

## 🟢 Struktura projektu

```
/
├── docs/                      # Dokumentacja projektu
│   ├── api/                   # Dokumentacja API
│   ├── database/              # Dokumentacja bazy danych
│   ├── developer-guide/       # Przewodniki dla deweloperów
│   └── user-guide/            # Instrukcje dla użytkowników
├── public/                    # Pliki publiczne
├── src/                       # Kod źródłowy
│   ├── api/                   # Komunikacja z API
│   ├── components/            # Komponenty React
│   │   ├── common/            # Wspólne komponenty
│   │   ├── layout/            # Komponenty układu strony
│   │   ├── transactions/      # Komponenty transakcji
│   │   └── budget/            # Komponenty budżetu
│   ├── contexts/              # Konteksty React
│   ├── hooks/                 # Własne hooki
│   ├── pages/                 # Komponenty stron
│   ├── services/              # Serwisy aplikacji
│   ├── store/                 # Stan Redux
│   ├── styles/                # Style CSS
│   └── utils/                 # Funkcje pomocnicze
├── .env                       # Zmienne środowiskowe
├── craco.config.js            # Konfiguracja Create React App
├── package.json               # Konfiguracja projektu
├── postcss.config.js          # Konfiguracja PostCSS
└── tailwind.config.js         # Konfiguracja Tailwind CSS
```

## 🟢 Instalacja i uruchomienie

1. Sklonuj repozytorium
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Skonfiguruj zmienne środowiskowe w pliku `.env`
4. Uruchom aplikację w trybie deweloperskim:
   ```bash
   npm start
   ```

## 🟢 Dostępne skrypty

- `npm start` - uruchamia aplikację w trybie deweloperskim
- `npm test` - uruchamia testy
- `npm run build` - buduje aplikację do produkcji

## 🟢 Dokumentacja

Pełna dokumentacja projektu znajduje się w katalogu `docs/`:

- [Instrukcja użytkownika](docs/user-guide/README.md)
- [Dokumentacja dla deweloperów](docs/developer-guide/README.md)
- [Dokumentacja API](docs/api/api.md)
- [Schemat bazy danych](docs/database/README.md)

## 🟢 Kredyty

- Avatary użytkowników pochodzą z kolekcji [alohe/avatars](https://github.com/alohe/avatars) udostępnionej na licencji MIT. Kolekcja avatarów zawiera różnorodne darmowe obrazy profilowe, które można wykorzystać w projektach w celu dodania im osobowości i charakteru.
- Ikony interfejsu pochodzą z biblioteki [React Icons](https://react-icons.github.io/react-icons/).
- Elementy UI wykorzystują framework [Tailwind CSS](https://tailwindcss.com/).

## 🟢 Licencja

Ten projekt jest objęty licencją MIT.

--
**Autor:** Marek161
