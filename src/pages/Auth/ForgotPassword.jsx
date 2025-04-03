import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaEnvelope } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setLoading(true);
      await resetPassword(email);
      setMessage("Sprawdź swoją skrzynkę email, aby zresetować hasło");
    } catch (error) {
      console.error("Błąd resetowania hasła:", error);
      setError("Nie udało się zresetować hasła");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card animated-card">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white glow-text">
              Resetowanie hasła
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Podaj swój adres email, a wyślemy Ci link do zresetowania hasła
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/30 text-red-200 border border-red-700/50 p-4 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 bg-green-900/30 text-green-200 border border-green-700/50 p-4 rounded-lg text-sm text-center">
              {message}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-green-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="Adres email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center"
            >
              {loading ? "Wysyłanie..." : "Resetuj hasło"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link
              to="/login"
              className="text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              Powrót do logowania
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
