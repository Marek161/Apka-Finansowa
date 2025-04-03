/**
 * Funkcje pomocnicze do przetwarzania obrazów
 */

/**
 * Funkcja wyjaśniająca jak podzielić duży obraz na mniejsze avatary
 * Ponieważ nie możemy fizycznie dzielić obrazów w przeglądarce, funkcja zawiera instrukcje
 */
export const generateAvatarsFromLargeImage = () => {
  return `INSTRUKCJA PODZIAŁU OBRAZU AVATARÓW

KROK 1: Przygotowanie
- Upewnij się, że plik 2757.jpg jest dostępny i zawiera siatkę 5x10 avatarów
- Upewnij się, że w folderze public/avatars/ istnieją katalogi:
  * professions
  * animals
  * nature
  * abstraction
  * technology

KROK 2: Podział obrazu
- Obraz ma wymiary 2757 x 2757 pikseli i zawiera siatkę 5x10 avatarów
- Każdy avatar ma wymiary około 275 x 275 pikseli
- Podziel obraz na 50 małych kwadratów i zapisz je w odpowiednich katalogach:

1. Katalog 'professions' - pierwszy wiersz (avatary 1-10)
   Pozycje: (0,0) do (9,0)
   Nazwy plików: avatar1.jpg do avatar10.jpg

2. Katalog 'animals' - drugi wiersz (avatary 11-20)
   Pozycje: (0,1) do (9,1)
   Nazwy plików: avatar1.jpg do avatar10.jpg

3. Katalog 'nature' - trzeci wiersz (avatary 21-30)
   Pozycje: (0,2) do (9,2)
   Nazwy plików: avatar1.jpg do avatar10.jpg

4. Katalog 'abstraction' - czwarty wiersz (avatary 31-40, ale używamy tylko 31-35)
   Pozycje: (0,3) do (4,3)
   Nazwy plików: avatar1.jpg do avatar5.jpg

5. Katalog 'technology' - piąty wiersz (avatary 41-50, ale używamy tylko 41-45)
   Pozycje: (0,4) do (4,4)
   Nazwy plików: avatar1.jpg do avatar5.jpg

KROK 3: Weryfikacja
- Sprawdź, czy wszystkie pliki zostały poprawnie wygenerowane
- Odśwież stronę i sprawdź, czy avatary są widoczne w interfejsie
`;
};

/**
 * Funkcja sprawdzająca, czy avatar jest dostępny
 * @param {string} url - URL avatara do sprawdzenia
 * @returns {Promise<boolean>} - True jeśli avatar istnieje i jest dostępny
 */
export const checkAvatarAvailability = async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    console.error(`Błąd sprawdzania dostępności avatara ${url}:`, error);
    return false;
  }
};

/**
 * Funkcja zastąpienia obrazów inicjałami
 * @param {string} name - Nazwa, z której generowane są inicjały
 * @param {string} color - Kolor tła (hex)
 * @param {number} size - Rozmiar obrazu w pikselach
 * @returns {string} - Data URL wygenerowanego obrazu SVG
 */
export const generateInitialsImage = (name, color = "#4F46E5", size = 200) => {
  // Pobierz inicjały
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    } else {
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }
  };

  const initials = getInitials(name);

  // Tworzymy SVG z inicjałami
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${color}" />
      <text x="${size / 2}" y="${size / 2}" dy=".1em" fill="white" font-family="Arial, sans-serif" font-size="${size / 2.5}" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>
  `;

  // Konwertujemy SVG do Data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
/**
 * Funkcja pomocnicza do identyfikacji problemów z avatar-ami
 * @param {Array} avatars - Lista avatarów do sprawdzenia
 * @returns {Promise<Object>} - Obiekt z informacjami o dostępności każdego avatara
 */
export const diagnoseAvatarsIssues = async (avatars) => {
  const results = {
    total: avatars.length,
    available: 0,
    unavailable: 0,
    details: {},
  };

  for (const avatar of avatars) {
    const isAvailable = await checkAvatarAvailability(avatar.url);

    results.details[avatar.id] = {
      name: avatar.name,
      url: avatar.url,
      available: isAvailable,
    };

    if (isAvailable) {
      results.available++;
    } else {
      results.unavailable++;
    }
  }

  return results;
};
