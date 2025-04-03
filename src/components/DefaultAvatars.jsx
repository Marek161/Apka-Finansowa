import React, { useState, useEffect } from "react";
import { PREDEFINED_AVATARS } from "../services/avatarService";
import { checkAvatarAvailability } from "../utils/imageUtils";
import { FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

// Komponent do wyświetlania dostępnych avatarów i ich statusu
const DefaultAvatars = () => {
  const [availabilityStatus, setAvailabilityStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const checkAllAvatars = async () => {
      setLoading(true);
      const status = {};

      // Sprawdzamy tylko avatary z kategorii vibrent
      const vibrentAvatars = PREDEFINED_AVATARS.filter(
        (avatar) => avatar.category === "vibrent"
      );

      for (const avatar of vibrentAvatars) {
        try {
          const isAvailable = await checkAvatarAvailability(avatar.url);
          status[avatar.id] = isAvailable;
        } catch (error) {
          status[avatar.id] = false;
        }
      }

      setAvailabilityStatus(status);
      setLoading(false);
    };

    checkAllAvatars();
  }, []);

  // Grupowanie avatarów według kategorii
  const getAvatarsByCategory = () => {
    const categories = {};

    PREDEFINED_AVATARS.forEach((avatar) => {
      if (avatar.category === "vibrent") {
        if (!categories[avatar.category]) {
          categories[avatar.category] = [];
        }
        categories[avatar.category].push(avatar);
      }
    });

    return categories;
  };

  const categories = getAvatarsByCategory();

  // Zliczanie dostępności według kategorii
  const getAvailabilitySummary = () => {
    const summary = {
      all: { total: 0, available: 0 },
    };

    Object.keys(categories).forEach((category) => {
      summary[category] = { total: 0, available: 0 };

      categories[category].forEach((avatar) => {
        summary[category].total++;
        summary.all.total++;

        if (availabilityStatus[avatar.id]) {
          summary[category].available++;
          summary.all.available++;
        }
      });
    });

    return summary;
  };

  const availabilitySummary = getAvailabilitySummary();

  // Tłumaczenia kategorii na polski
  const categoryTranslations = {
    vibrent: "Avatary Vibrent",
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-white font-medium mb-2">Wybierz kategorię:</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded text-sm ${
              activeCategory === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
            onClick={() => setActiveCategory("all")}
          >
            Wszystkie ({availabilitySummary.all.available}/
            {availabilitySummary.all.total})
          </button>

          {Object.keys(categories).map((category) => (
            <button
              key={category}
              className={`px-3 py-1 rounded text-sm ${
                activeCategory === category
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {categoryTranslations[category]} (
              {availabilitySummary[category]?.available || 0}/
              {availabilitySummary[category]?.total || 0})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <FaSpinner className="text-green-400 animate-spin text-2xl mr-2" />
          <span className="text-white">
            Sprawdzanie dostępności avatarów...
          </span>
        </div>
      ) : (
        <div>
          <div className="mb-2 text-sm text-gray-400">
            Dostępnych avatarów: {availabilitySummary.all.available} z{" "}
            {availabilitySummary.all.total}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {(activeCategory === "all"
              ? PREDEFINED_AVATARS
              : categories[activeCategory] || []
            ).map((avatar) => {
              const isAvailable = availabilityStatus[avatar.id];
              return (
                <div
                  key={avatar.id}
                  className={`relative p-1 rounded-lg border ${
                    isAvailable ? "border-green-500/50" : "border-red-500/50"
                  } bg-gray-800/50`}
                >
                  <div className="absolute top-2 right-2 z-10">
                    {isAvailable ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </div>
                  <div className="aspect-square relative overflow-hidden rounded">
                    {isAvailable ? (
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = null;
                          e.target.style.backgroundColor = avatar.fallbackColor;
                          e.target.style.display = "flex";
                          e.target.style.justifyContent = "center";
                          e.target.style.alignItems = "center";
                          e.target.style.color = "white";
                          e.target.style.fontSize = "1.5rem";
                          e.target.style.fontWeight = "bold";
                          e.target.innerHTML = avatar.name.substring(0, 1);
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: avatar.fallbackColor }}
                      >
                        {avatar.name.substring(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-center">
                    <p className="text-white text-xs truncate">{avatar.name}</p>
                    <p className="text-gray-400 text-xs">
                      {categoryTranslations[avatar.category]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {availabilitySummary.all.available === 0 && (
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded text-sm text-yellow-200">
              <p>
                <strong>Uwaga:</strong> Żaden z avatarów nie jest dostępny.
                Upewnij się, że:
              </p>
              <ol className="list-decimal list-inside mt-2 ml-2 space-y-1">
                <li>Zdjęcie 2757.jpg zostało podzielone na mniejsze części</li>
                <li>Avatary zostały umieszczone w odpowiednich katalogach</li>
                <li>
                  Katalogi zostały utworzone w ścieżce /public/avatars/...
                </li>
                <li>
                  Nazwy plików są zgodne ze wzorem avatarX.jpg (gdzie X to numer
                  avatara)
                </li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DefaultAvatars;
