import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "../firebase";
import {
  FaUser,
  FaSave,
  FaCog,
  FaExchangeAlt,
  FaCheck,
  FaImage,
} from "react-icons/fa";
import {
  getExchangeRate,
  getAvailableCurrencies,
  formatCurrency,
} from "../services/currencyService";
import {
  generateInitialsAvatar,
  getInitials,
  getAllAvatars,
} from "../services/avatarService";

const Settings = () => {
  const { currentUser, updateUserProfile, refreshUserData, auth } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [generatedAvatar, setGeneratedAvatar] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("PLN");
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [availableAvatars, setAvailableAvatars] = useState([]);
  const currencies = getAvailableCurrencies();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, "userProfiles", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDisplayName(userData.displayName || "");
          setPhotoURL(userData.photoURL || "");
          setSelectedCurrency(userData.currency || "PLN");
        } else if (currentUser.displayName || currentUser.photoURL) {
          // Jeśli profil nie istnieje, ale mamy dane z Auth
          setDisplayName(currentUser.displayName || "");
          setPhotoURL(currentUser.photoURL || "");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setMessage({
          type: "error",
          text: "Nie udało się pobrać danych profilu.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  // Efekt generujący awatar przy zmianie displayName
  useEffect(() => {
    if (displayName) {
      setGeneratedAvatar(generateInitialsAvatar(displayName));
    } else if (currentUser?.email) {
      const username = currentUser.email.split("@")[0];
      setGeneratedAvatar(generateInitialsAvatar(username));
    }

    // Generujemy dostępne awatary
    setAvailableAvatars(getAllAvatars(displayName, currentUser?.email));
  }, [displayName, currentUser?.email]);

  // Efekt pobierający kurs walut po zmianie waluty
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (selectedCurrency === "PLN") {
        setExchangeRate(1);
        return;
      }

      try {
        const rate = await getExchangeRate(selectedCurrency);
        setExchangeRate(rate);
      } catch (error) {
        console.error("Błąd podczas pobierania kursu waluty:", error);
        setExchangeRate(null);
      }
    };

    fetchExchangeRate();
  }, [selectedCurrency]);

  const handleCurrencyChange = async (e) => {
    const newCurrency = e.target.value;
    setSelectedCurrency(newCurrency);

    try {
      setIsSubmitting(true);
      setMessage(null);

      // Aktualizacja profilu w Firestore i Auth
      await updateUserProfile({
        currency: newCurrency,
      });

      // Pobierz nowy kurs wymiany
      if (newCurrency !== "PLN") {
        const rate = await getExchangeRate(newCurrency);
        setExchangeRate(rate);
      } else {
        setExchangeRate(1);
      }

      setMessage({
        type: "success",
        text: "Waluta została zaktualizowana pomyślnie!",
      });
    } catch (error) {
      console.error("Błąd podczas aktualizacji waluty:", error);
      setMessage({
        type: "error",
        text: "Nie udało się zaktualizować waluty. Spróbuj ponownie później.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarSelect = async (avatarUrl) => {
    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      // Aktualizacja stanu lokalnego
      setSelectedAvatar(avatarUrl);
      setPhotoURL(avatarUrl);

      // Aktualizacja profilu w Firestore
      const userProfileRef = doc(db, "userProfiles", currentUser.uid);
      await updateDoc(userProfileRef, {
        photoURL: avatarUrl,
        updatedAt: new Date(),
      });

      // Aktualizacja profilu w Authentication
      await updateProfile(auth.currentUser, {
        photoURL: avatarUrl,
      });

      // Aktualizacja stanu w kontekście
      await updateUserProfile({
        photoURL: avatarUrl,
      });

      setSuccess("Avatar został zaktualizowany pomyślnie!");
    } catch (error) {
      console.error("Błąd podczas aktualizacji avatara:", error);
      setError(
        "Nie udało się zaktualizować avatara. Spróbuj ponownie później."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Przygotowanie danych profilu do aktualizacji
      const profileData = {
        displayName,
        currency: selectedCurrency,
        updatedAt: new Date(),
      };

      // Dodanie avatarUrl do danych profilu, jeśli został wybrany nowy avatar
      if (selectedAvatar) {
        profileData.photoURL = selectedAvatar;
        setPhotoURL(selectedAvatar);
      }

      // Aktualizacja profilu w Firestore
      if (currentUser) {
        const userDocRef = doc(db, "userProfiles", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Aktualizacja istniejącego dokumentu
          await updateDoc(userDocRef, profileData);
        } else {
          // Utworzenie nowego dokumentu dla użytkownika
          await setDoc(userDocRef, {
            ...profileData,
            createdAt: new Date(),
          });
        }

        // Aktualizacja profilu w Auth
        try {
          const authUpdateData = {};

          if (displayName) {
            authUpdateData.displayName = displayName;
          }

          // Zaktualizuj avatar w Auth jeśli został zmieniony
          if (selectedAvatar) {
            authUpdateData.photoURL = selectedAvatar;
          }

          if (Object.keys(authUpdateData).length > 0) {
            // Używamy funkcji updateUserProfile z kontekstu Auth
            await updateUserProfile(authUpdateData);

            // Odświeżamy dane użytkownika
            await refreshUserData();

            // Zapisz ustawienia w localStorage
            localStorage.setItem(
              "userSettings",
              JSON.stringify({
                displayName,
                currency: selectedCurrency,
                photoURL: selectedAvatar || photoURL,
              })
            );

            setMessage({
              type: "success",
              text: "Profil został zaktualizowany pomyślnie!",
            });
          } else {
            setMessage({
              type: "success",
              text: "Ustawienia zostały zapisane pomyślnie!",
            });
          }
        } catch (authError) {
          console.error("Błąd aktualizacji profilu Auth:", authError);
          setMessage({
            type: "warning",
            text: "Profil został częściowo zaktualizowany, ale wystąpił problem z aktualizacją avatara.",
          });
        }
      }
    } catch (error) {
      console.error("Błąd aktualizacji profilu:", error);
      setMessage({
        type: "error",
        text: `Nie udało się zaktualizować profilu: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dodajemy efekt do ładowania ustawień z localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDisplayName(settings.displayName || displayName);
      setSelectedCurrency(settings.currency || selectedCurrency);
      if (settings.photoURL) {
        setPhotoURL(settings.photoURL);
        setSelectedAvatar(settings.photoURL);
      }
    }
  }, []);

  // Pomocnicza funkcja grupująca avatary wg kategorii
  const getAvatarsByCategory = () => {
    const categories = {};

    availableAvatars.forEach((avatar) => {
      // Pokazujemy tylko kategorie Vibrent i avatary bez kategorii
      if (avatar.category === "vibrent") {
        if (!categories[avatar.category]) {
          categories[avatar.category] = [];
        }

        categories[avatar.category].push(avatar);
      } else if (!avatar.category) {
        // Dla starych avatarów bez kategorii
        if (!categories["other"]) {
          categories["other"] = [];
        }
        categories["other"].push(avatar);
      }
    });

    return categories;
  };

  // Tłumaczenia kategorii na polski
  const categoryTranslations = {
    vibrent: "Avatary Vibrent",
    other: "Inne",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white flex items-center">
          <FaCog className="text-green-400 mr-3" />
          <span>Ustawienia profilu</span>
        </h1>
      </div>

      {message && (
        <div
          className={`p-4 mb-6 rounded-lg ${
            message.type === "error"
              ? "bg-red-900/30 text-red-200 border border-red-700"
              : "bg-green-900/30 text-green-200 border border-green-700"
          } animate-[fade-in_0.3s_ease-out_forwards]`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-800/30 rounded-lg border border-gray-700/40 overflow-hidden shadow-xl">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Imię
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
                    placeholder="Twoje imię"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Wystarczy podać samo imię - tak będziesz widoczny/a w
                    aplikacji.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Awatar
                  </label>

                  <div className="flex items-center mb-3">
                    <div className="mr-4 relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600">
                        {selectedAvatar ? (
                          <img
                            src={selectedAvatar}
                            alt="Awatar"
                            className="w-full h-full object-cover"
                          />
                        ) : generatedAvatar ? (
                          <img
                            src={generatedAvatar}
                            alt="Wygenerowany awatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaUser className="text-gray-500 text-3xl" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <button
                        type="button"
                        onClick={() =>
                          setShowAvatarSelector(!showAvatarSelector)
                        }
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center transition-all duration-300"
                      >
                        <FaImage className="mr-2" />
                        {showAvatarSelector
                          ? "Ukryj galerię"
                          : "Wybierz awatar"}
                      </button>
                    </div>
                  </div>

                  {/* Sekcja wyboru avatara */}
                  {showAvatarSelector && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-white mb-4">
                        Wybierz awatar:
                      </h3>

                      {/* Dostępne avatary */}
                      <div className="mb-6">
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                          {availableAvatars
                            .filter((avatar) => avatar.category === "vibrent")
                            .map((avatar) => (
                              <div
                                key={avatar.id}
                                className={`cursor-pointer p-1 rounded-lg border ${
                                  selectedAvatar === avatar.url
                                    ? "border-green-500 border-2"
                                    : "border-gray-700 hover:border-gray-500"
                                }`}
                                onClick={() => handleAvatarSelect(avatar.url)}
                              >
                                <div className="aspect-square relative overflow-hidden rounded-md">
                                  <img
                                    src={avatar.url}
                                    alt={avatar.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = null;
                                      e.target.style.backgroundColor =
                                        avatar.fallbackColor;
                                      e.target.style.display = "flex";
                                      e.target.style.justifyContent = "center";
                                      e.target.style.alignItems = "center";
                                      e.target.style.color = "white";
                                      e.target.style.fontSize = "1.5rem";
                                      e.target.style.fontWeight = "bold";
                                      e.target.innerHTML =
                                        avatar.name.substring(0, 1);
                                    }}
                                  />
                                </div>
                                <div className="mt-1 text-center">
                                  <p className="text-white text-xs truncate">
                                    {avatar.name}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Pozostałe kategorie avatarów */}
                      {Object.keys(getAvatarsByCategory())
                        .filter((category) => category !== "vibrent")
                        .map((category) => (
                          <div key={category} className="mb-6">
                            <h4 className="text-md font-medium text-white mb-2">
                              {categoryTranslations[category] || category}:
                            </h4>
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                              {getAvatarsByCategory()[category].map(
                                (avatar) => (
                                  <div
                                    key={avatar.id}
                                    className={`cursor-pointer p-1 rounded-lg border ${
                                      selectedAvatar === avatar.url
                                        ? "border-green-500 border-2"
                                        : "border-gray-700 hover:border-gray-500"
                                    }`}
                                    onClick={() =>
                                      handleAvatarSelect(avatar.url)
                                    }
                                  >
                                    <div className="aspect-square relative overflow-hidden rounded-md">
                                      <img
                                        src={avatar.url}
                                        alt={avatar.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = null;
                                          e.target.style.backgroundColor =
                                            avatar.fallbackColor;
                                          e.target.style.display = "flex";
                                          e.target.style.justifyContent =
                                            "center";
                                          e.target.style.alignItems = "center";
                                          e.target.style.color = "white";
                                          e.target.style.fontSize = "1.5rem";
                                          e.target.style.fontWeight = "bold";
                                          e.target.innerHTML =
                                            avatar.name.substring(0, 1);
                                        }}
                                      />
                                    </div>
                                    <div className="mt-1 text-center">
                                      <p className="text-white text-xs truncate">
                                        {avatar.name}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ))}

                      <button
                        type="button"
                        className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                        onClick={() => setShowAvatarSelector(false)}
                      >
                        Zamknij
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="currency"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Preferowana waluta
                  </label>
                  <select
                    id="currency"
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
                  >
                    {currencies.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.name} ({curr.code}) {curr.symbol}
                      </option>
                    ))}
                  </select>

                  {/* Informacja o kursie wymiany */}
                  {selectedCurrency !== "PLN" && exchangeRate && (
                    <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-300 flex items-center">
                        <FaExchangeAlt className="text-green-400 mr-2" />
                        Aktualny kurs: 1 {selectedCurrency} ={" "}
                        {exchangeRate.toFixed(4)} PLN
                      </p>
                      <div className="mt-2 text-xs text-gray-400">
                        <p>Przykładowe przeliczenia:</p>
                        <ul className="space-y-1 mt-1">
                          <li>
                            100 PLN ={" "}
                            {formatCurrency(
                              100 / exchangeRate,
                              selectedCurrency
                            )}
                          </li>
                          <li>
                            100 {selectedCurrency} ={" "}
                            {formatCurrency(100 * exchangeRate, "PLN")}
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-green-400 to-cyan-500 rounded-lg text-white shadow-lg hover:from-green-500 hover:to-cyan-600 transition-all duration-300 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Zapisywanie...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      <span>Zapisz ustawienia</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-gray-800/30 rounded-lg border border-gray-700/40 overflow-hidden shadow-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FaUser className="text-green-400 mr-2" />
              <span>Podgląd profilu</span>
            </h2>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 border-4 border-gray-600 mb-3">
                {selectedAvatar ? (
                  <img
                    src={selectedAvatar}
                    alt="Zdjęcie profilowe"
                    className="w-full h-full object-cover"
                  />
                ) : generatedAvatar ? (
                  <img
                    src={generatedAvatar}
                    alt="Wygenerowany awatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-gray-500 text-5xl" />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-semibold text-white">
                {displayName || "Twoje imię"}
              </h3>
              <p className="text-gray-400 mt-1">
                {currentUser?.email || "twój@email.com"}
              </p>
              <p className="text-green-400 mt-3">
                Preferowana waluta: {selectedCurrency}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wyświetlanie komunikatów */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg">
          {success}
        </div>
      )}
    </div>
  );
};

export default Settings;
