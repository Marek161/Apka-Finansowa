#!/bin/bash

echo "Przygotowywanie repozytorium do commita na GitHub..."

# Sprawdzenie czy .env nie zostanie commitowany
if git ls-files --cached | grep -q "\.env$"; then
  echo "UWAGA: Plik .env znajduje się w staging area i zostanie commitowany!"
  echo "Usuń go z staging area za pomocą: git rm --cached .env"
  exit 1
fi

# Sprawdzenie czy .env.development nie zostanie commitowany
if git ls-files --cached | grep -q "\.env\.development$"; then
  echo "UWAGA: Plik .env.development znajduje się w staging area i zostanie commitowany!"
  echo "Usuń go z staging area za pomocą: git rm --cached .env.development"
  exit 1
fi

# Sprawdzenie czy .env.production nie zostanie commitowany
if git ls-files --cached | grep -q "\.env\.production$"; then
  echo "UWAGA: Plik .env.production znajduje się w staging area i zostanie commitowany!"
  echo "Usuń go z staging area za pomocą: git rm --cached .env.production"
  exit 1
fi

# Sprawdzenie czy są pliki .env.*.local
if git ls-files --cached | grep -q "\.env\..*\.local$"; then
  echo "UWAGA: Pliki .env.*.local znajdują się w staging area i zostaną commitowane!"
  echo "Usuń je z staging area za pomocą: git rm --cached [nazwa_pliku]"
  exit 1
fi

# Sprawdzanie, czy nie ma wrażliwych danych w commitowanych plikach
echo "Sprawdzanie, czy nie ma wrażliwych danych w commitowanych plikach..."

# Lista wzorców, które mogą wskazywać na wrażliwe dane
patterns=(
  "API_KEY"
  "SECRET"
  "PASSWORD"
  "FIREBASE_API_KEY"
  "GOOGLE_API_KEY"
  "TOKEN"
)

# Sprawdzanie plików w staging area
for pattern in "${patterns[@]}"; do
  result=$(git diff --cached | grep -i "$pattern" | grep -v "example\|your_\|placeholder")
  if [ ! -z "$result" ]; then
    echo "UWAGA: Znaleziono potencjalnie wrażliwe dane zawierające '$pattern'!"
    echo "$result"
    echo "Rozważ usunięcie tych danych lub dodanie plików do .gitignore"
    exit 1
  fi
done

echo "Sprawdzanie zakończone. Nie znaleziono potencjalnie wrażliwych danych."
echo "Wszystko gotowe do commita!"
exit 0 