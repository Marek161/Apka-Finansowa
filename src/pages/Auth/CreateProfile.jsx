import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { avatarOptions } from "../../utils/avatarOptions";

const CreateProfile = () => {
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [currency, setCurrency] = useState("PLN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Pre-fill display name if available from auth provider
    if (auth.currentUser?.displayName) {
      setDisplayName(auth.currentUser.displayName);
    }
  }, [auth.currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!displayName) {
      return setError("Proszę podać imię");
    }

    try {
      setError("");
      setLoading(true);

      const userId = auth.currentUser.uid;
      const photoURL = avatarOptions[selectedAvatar];

      // Update auth profile with display name and avatar
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL,
      });

      // Create user profile in Firestore
      await setDoc(doc(db, "userProfiles", userId), {
        displayName,
        avatarId: selectedAvatar,
        photoURL, // Save the avatar URL to the profile
        currency,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Błąd podczas tworzenia profilu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Utwórz swój profil
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Wybierz avatar i podaj swoje imię
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="display-name"
                className="block text-sm font-medium text-gray-700"
              >
                Imię
              </label>
              <div className="mt-1">
                <input
                  id="display-name"
                  name="display-name"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Twoje imię"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wybierz avatar
              </label>
              <div className="grid grid-cols-5 gap-3">
                {avatarOptions.map((avatar, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer p-2 rounded-lg ${selectedAvatar === index ? "bg-blue-100 ring-2 ring-blue-500" : "hover:bg-gray-100"}`}
                    onClick={() => setSelectedAvatar(index)}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className="w-12 h-12 rounded-full mx-auto"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-gray-700"
              >
                Preferowana waluta
              </label>
              <select
                id="currency"
                name="currency"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="PLN">Polski złoty (PLN)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dolar amerykański (USD)</option>
                <option value="GBP">Funt brytyjski (GBP)</option>
                <option value="CHF">Frank szwajcarski (CHF)</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? "Tworzenie profilu..." : "Utwórz profil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;
