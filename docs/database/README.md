# Schemat Bazy Danych

## Kolekcje Firestore

### Użytkownicy (users)

```javascript
{
  id: string,          // ID użytkownika (uid z Firebase Auth)
  email: string,       // Adres email
  displayName: string, // Nazwa wyświetlana
  createdAt: timestamp,// Data utworzenia konta
  updatedAt: timestamp // Data ostatniej aktualizacji
}
```

### Transakcje (transactions)

```javascript
{
  id: string,          // ID transakcji
  userId: string,      // ID użytkownika (referencja do users)
  type: string,        // "income" | "expense"
  amount: number,      // Kwota
  category: string,    // Kategoria
  description: string, // Opis
  date: timestamp,     // Data transakcji
  createdAt: timestamp,// Data utworzenia
  updatedAt: timestamp // Data ostatniej aktualizacji
}
```

### Budżety (budgets)

```javascript
{
  id: string,          // ID budżetu
  userId: string,      // ID użytkownika (referencja do users)
  category: string,    // Kategoria
  amount: number,      // Kwota budżetu
  period: string,      // "monthly" | "yearly"
  createdAt: timestamp,// Data utworzenia
  updatedAt: timestamp // Data ostatniej aktualizacji
}
```

### Kategorie (categories)

```javascript
{
  id: string,          // ID kategorii
  userId: string,      // ID użytkownika (referencja do users)
  name: string,        // Nazwa kategorii
  type: string,        // "income" | "expense"
  color: string,       // Kolor kategorii (hex)
  createdAt: timestamp,// Data utworzenia
  updatedAt: timestamp // Data ostatniej aktualizacji
}
```

## Diagram relacji

```
+----------------+       +-------------------+
|    UŻYTKOWNICY |       |     TRANSAKCJE    |
+----------------+       +-------------------+
| id             |<----->| userId            |
| email          |       | id                |
| displayName    |       | type              |
| createdAt      |       | amount            |
| updatedAt      |       | category          |
+----------------+       | description       |
                         | date              |
                         | createdAt         |
                         | updatedAt         |
                         +-------------------+
                                 ^
                                 |
                                 |
+----------------+       +-------------------+
|     BUDŻETY    |       |     KATEGORIE     |
+----------------+       +-------------------+
| id             |       | id                |
| userId         |<----->| userId            |
| category       |<----->| name              |
| amount         |       | type              |
| period         |       | color             |
| createdAt      |       | createdAt         |
| updatedAt      |       | updatedAt         |
+----------------+       +-------------------+
```

## Opis relacji

1. **Użytkownik → Transakcje**: Relacja jeden do wielu. Każdy użytkownik może mieć wiele transakcji, a każda transakcja jest przypisana do jednego użytkownika.

2. **Użytkownik → Budżety**: Relacja jeden do wielu. Każdy użytkownik może mieć wiele budżetów, a każdy budżet jest przypisany do jednego użytkownika.

3. **Użytkownik → Kategorie**: Relacja jeden do wielu. Każdy użytkownik może mieć wiele własnych kategorii, a każda kategoria jest przypisana do jednego użytkownika.

4. **Kategorie → Transakcje**: Relacja jeden do wielu. Każda kategoria może być używana w wielu transakcjach.

5. **Kategorie → Budżety**: Relacja jeden do wielu. Każda kategoria może być używana w wielu budżetach.

## Indeksy

Dla zoptymalizowania wydajności zapytań, zdefiniowano następujące indeksy:

### Transakcje

- `userId` + `date` (malejąco) - optymalizacja wyświetlania historii transakcji
- `userId` + `type` + `date` (malejąco) - filtrowanie według typu transakcji
- `userId` + `category` + `date` (malejąco) - filtrowanie według kategorii

### Budżety

- `userId` + `category` - wyszukiwanie budżetu dla określonej kategorii
- `userId` + `period` - filtrowanie budżetów według okresu (miesięczne/roczne)

### Kategorie

- `userId` + `type` - filtrowanie kategorii według typu (przychód/wydatek)
- `userId` + `name` - wyszukiwanie kategorii po nazwie

## Reguły bezpieczeństwa Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Funkcje pomocnicze
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Reguły dla users
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow write: if isAuthenticated() && isOwner(userId);
    }

    // Reguły dla transactions
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
    }

    // Reguły dla budgets
    match /budgets/{budgetId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
    }

    // Reguły dla categories
    match /categories/{categoryId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
  }
}
```

## Strategie optymalizacji

1. **Denormalizacja**: Przechowywanie wybranych danych w wielu miejscach, aby zmniejszyć liczbę zapytań (np. kategoria w transakcji zamiast tylko ID).

2. **Kompozycja ID dokumentów**: Tworzenie ID dokumentów w sposób umożliwiający łatwe wyszukiwanie (np. `{userId}_{categoryId}`).

3. **Stronicowanie**: Pobieranie danych w mniejszych porcjach, aby zmniejszyć obciążenie i przyspieszyć ładowanie.

4. **Indeksowanie**: Tworzenie indeksów dla najczęściej używanych zapytań, aby przyspieszyć wyszukiwanie.

5. **Agregacje**: Przechowywanie zagregowanych danych (np. sumy miesięczne) w oddzielnych dokumentach, aby uniknąć ciągłego przeliczania.

## Ograniczenia i limity

1. **Rozmiar dokumentu**: Maksymalny rozmiar dokumentu w Firestore to 1MB.

2. **Głębokość zapytań**: Firestore nie obsługuje złożonych zapytań zagnieżdżonych, dlatego struktura danych jest zaprojektowana tak, aby minimalizować potrzebę takich zapytań.

3. **Koszty**: Struktura bazy danych jest zoptymalizowana pod kątem minimalizacji kosztów, poprzez ograniczenie liczby odczytów i zapisów.
