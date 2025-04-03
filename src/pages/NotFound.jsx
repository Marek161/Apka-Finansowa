import React from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaHome, FaArrowLeft } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900 overflow-hidden animated-bg">
      <div className="container px-6 py-12 mx-auto text-center">
        <div className="animated-card bg-gray-800/30 border border-gray-700/40 rounded-lg p-8 md:p-12 max-w-2xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="rounded-full bg-yellow-500/20 p-6">
              <FaExclamationTriangle className="text-yellow-400 h-16 w-16 animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-200 mb-6">
            Strona nie znaleziona
          </h2>

          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Strona, której szukasz, nie istnieje lub została przeniesiona.
            Sprawdź czy adres URL jest poprawny lub wróć do strony głównej.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary flex items-center justify-center"
            >
              <FaHome className="mr-2" />
              Strona główna
            </Link>

            <button
              onClick={() => window.history.back()}
              className="btn-secondary flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" />
              Wróć
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
