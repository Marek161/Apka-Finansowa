# Schemat Bazy Danych

## Kolekcje Firebase

### users

```javascript
{
  id: string,          // ID użytkownika (uid z Firebase Auth)
  email: string,       // Adres email
  displayName: string, // Nazwa wyświetlana
  createdAt: timestamp,// Data utworzenia konta
  updatedAt: timestamp // Data ostatniej aktualizacji
}
```

### transactions

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

### budgets

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

### categories

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

## Indeksy

### transactions

- userId + date (desc)
- userId + type + date (desc)
- userId + category + date (desc)

### budgets

- userId + category
- userId + period

### categories

- userId + type
- userId + name

## Relacje

- Każda transakcja jest powiązana z użytkownikiem przez `userId`
- Każdy budżet jest powiązany z użytkownikiem przez `userId`
- Każda kategoria jest powiązana z użytkownikiem przez `userId`
- Transakcje i budżety mogą być powiązane z kategoriami przez pole `category`

## Reguły bezpieczeństwa

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
