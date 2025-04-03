import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaEnvelope, FaLock } from "react-icons/fa";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      return setError("Hasła nie są identyczne");
    }

    try {
      setLoading(true);
      await signup(email, password);
      navigate("/create-profile");
    } catch (error) {
      console.error("Błąd rejestracji:", error);
      setError("Nie udało się utworzyć konta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-[#1e1e1e] rounded-lg p-8 shadow-xl border border-gray-800">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Utwórz nowe konto</h2>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/30 text-red-200 border border-red-700/50 p-4 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-[#2d2d2d] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Adres email"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-[#2d2d2d] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Hasło"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password-confirm"
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-[#2d2d2d] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Potwierdź hasło"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex justify-center items-center"
            >
              {loading ? "Tworzenie konta..." : "Zarejestruj się"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Masz już konto? </span>
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Zaloguj się
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
