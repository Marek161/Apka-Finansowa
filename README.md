# 🟢 Aplikacja Finansowa

Aplikacja Finansowa to nowoczesne narzędzie do zarządzania osobistymi finansami, zbudowane przy użyciu React i Firebase. Aplikacja umożliwia śledzenie przychodów i wydatków, zarządzanie budżetem oraz wizualizację danych finansowych.

### ➡️  [LINK DO STRONY](https://apka-finansowa-git-master-marek161s-projects.vercel.app/login)  ⬅️

![apka finansowa1](https://github.com/user-attachments/assets/30e3cf02-fa04-44be-a49d-c5e449673664)
![apka finansowa2](https://github.com/user-attachments/assets/22af59fa-d55d-4743-a0c0-7978fac6ac9d)
![apka finansowa3](https://github.com/user-attachments/assets/eef52f2b-7b12-4728-9d98-5a3d5b8487e7)



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
- Chart.js
- Jest & React Testing Library

## 🟢 Struktura projektu

```
/
├── docs/                        # Dokumentacja projektu
│   ├── api/                     # Dokumentacja API
│   ├── database/                # Dokumentacja bazy danych
│   ├── developer-guide/         # Przewodniki dla deweloperów
│   └── user-guide/              # Instrukcje dla użytkowników
├── public/                      # Pliki publiczne
├── src/                         # Kod źródłowy
│   ├── components/              # Komponenty React
│   │   ├── common/              # Wspólne komponenty
│   │   ├── dashboard/           # Komponenty pulpitu
│   │   ├── layout/              # Komponenty układu strony
│   │   ├── layouts/             # Alternatywne układy stron
│   │   ├── transactions/        # Komponenty transakcji
│   │   ├── calendar/            # Komponenty kalendarza
│   │   ├── DashboardCharts.jsx  # Wykresy na pulpicie
│   │   ├── DashboardSummary.jsx # Podsumowanie na pulpicie
│   │   ├── DevelopmentHelper.jsx# Pomocnik trybu deweloperskiego
│   │   ├── FirebaseIndexHelper.jsx # Pomocnik dla indeksów Firebase
│   │   ├── Layout.jsx           # Główny układ aplikacji
│   │   ├── LoadingScreen.jsx    # Ekran ładowania
│   │   ├── Notifications.jsx    # Komponent powiadomień
│   │   ├── PrivateRoute.jsx     # Komponent chronionej ścieżki
│   │   ├── ProtectedRoute.jsx   # Komponent chronionej trasy
│   │   ├── RecentTransactions.jsx # Ostatnie transakcje
│   │   └── Sidebar.jsx          # Pasek boczny
│   ├── contexts/                # Konteksty React
│   │   ├── AuthContext.jsx      # Kontekst autoryzacji
│   │   ├── BudgetContext.jsx    # Kontekst budżetu
│   │   ├── NotificationsContext.jsx # Kontekst powiadomień
│   │   └── ThemeContext.jsx     # Kontekst motywu
│   ├── layouts/                 # Układy stron
│   ├── pages/                   # Strony aplikacji
│   │   ├── Auth/                # Strony autoryzacji
│   │   ├── Budget/              # Strony budżetu
│   │   ├── Transactions/        # Strony transakcji
│   │   ├── Budget.jsx           # Główna strona budżetu
│   │   ├── Dashboard.jsx        # Pulpit główny
│   │   ├── ErrorPage.jsx        # Strona błędu
│   │   ├── ForgotPassword.jsx   # Odzyskiwanie hasła
│   │   ├── Login.jsx            # Logowanie
│   │   ├── NotFound.jsx         # Strona 404
│   │   ├── Register.jsx         # Rejestracja
│   │   ├── Settings.jsx         # Ustawienia
│   │   └── Transactions.jsx     # Strona transakcji
│   ├── services/                # Serwisy aplikacji
│   ├── store/                   # Stan Redux
│   ├── utils/                   # Funkcje pomocnicze
│   ├── App.js                   # Główny komponent aplikacji
│   ├── App.jsx                  # Alternatywny komponent główny
│   ├── firebase.js              # Konfiguracja Firebase
│   ├── index.css                # Główny plik CSS
│   ├── index.js                 # Punkt wejściowy aplikacji
│   ├── reportWebVitals.js       # Raportowanie wydajności
│   ├── serviceWorker.js         # Service Worker dla PWA
│   └── tailwind.css             # Style Tailwind
├── README.md                    # Dokumentacja projektu
├── craco.config.js              # Konfiguracja Create React App
├── package.json                 # Konfiguracja projektu
├── postcss.config.js            # Konfiguracja PostCSS
├── prepare-commit.sh            # Skrypt pomocniczy Git
└── tailwind.config.js           # Konfiguracja Tailwind CSS
```


## 🟢 Instalacja i uruchomienie

1. Sklonuj repozytorium
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Skonfiguruj zmienne środowiskowe w pliku `.env` (skorzystaj z `.env.example`)
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

🟢 Future Plans

W przyszłości dodatkowe funkcjonalności. Bardziej zaawansowane zarządzanie budżetem i walutami. Integracja z wiekszą ilością kalendarzy notion itd.
