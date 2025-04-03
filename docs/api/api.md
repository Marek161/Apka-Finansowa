# Dokumentacja API

## Autoryzacja

### Rejestracja użytkownika

```javascript
POST /auth/register
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### Logowanie

```javascript
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### Resetowanie hasła

```javascript
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "string"
}
```

## Transakcje

### Pobieranie transakcji

```javascript
GET /transactions
Query Parameters:
- type: "income" | "expense"
- category: string
- startDate: string (ISO)
- endDate: string (ISO)
```

### Dodawanie transakcji

```javascript
POST /transactions
Content-Type: application/json

{
  "type": "income" | "expense",
  "amount": number,
  "category": string,
  "description": string,
  "date": string (ISO)
}
```

### Aktualizacja transakcji

```javascript
PUT /transactions/:id
Content-Type: application/json

{
  "type": "income" | "expense",
  "amount": number,
  "category": string,
  "description": string,
  "date": string (ISO)
}
```

### Usuwanie transakcji

```javascript
DELETE /transactions/:id
```

## Budżet

### Pobieranie budżetów

```javascript
GET / budgets;
```

### Dodawanie budżetu

```javascript
POST /budgets
Content-Type: application/json

{
  "category": string,
  "amount": number,
  "period": "monthly" | "yearly"
}
```

### Aktualizacja budżetu

```javascript
PUT /budgets/:id
Content-Type: application/json

{
  "category": string,
  "amount": number,
  "period": "monthly" | "yearly"
}
```

### Usuwanie budżetu

```javascript
DELETE /budgets/:id
```

## Obsługa błędów

Wszystkie endpointy zwracają odpowiednie kody HTTP:

- 200: Sukces
- 400: Nieprawidłowe dane
- 401: Brak autoryzacji
- 403: Brak uprawnień
- 404: Nie znaleziono
- 500: Błąd serwera

Format odpowiedzi z błędem:

```javascript
{
  "error": {
    "code": string,
    "message": string
  }
}
```
