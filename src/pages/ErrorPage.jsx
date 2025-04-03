import React from "react";
import { Link, useNavigate, useRouteError } from "react-router-dom";
import { FaBug, FaHome, FaRedo, FaExclamationCircle } from "react-icons/fa";

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  // Obsługa różnych typów błędów
  const getErrorMessage = () => {
    if (error?.status === 404) {
      return "Strona, której szukasz, nie istnieje lub została przeniesiona.";
    }

    if (error?.message) {
      return error.message;
    }

    return "Wystąpił nieoczekiwany błąd aplikacji. Spróbuj odświeżyć stronę lub wróć później.";
  };

  // Kod statusu HTTP (jeśli dostępny)
  const getStatusCode = () => {
    if (error?.status) {
      return error.status;
    }
    return "500";
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900 overflow-hidden animated-bg">
      <div className="container px-6 py-12 mx-auto text-center">
        <div className="animated-card bg-gray-800/30 border border-red-700/40 rounded-lg p-8 md:p-12 max-w-2xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="rounded-full bg-red-500/20 p-6">
              <FaBug className="text-red-400 h-16 w-16 animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">
            {getStatusCode()}
          </h1>
          <h2 className="text-2xl font-semibold text-gray-200 mb-6">
            Błąd aplikacji
          </h2>

          <div className="bg-red-900/30 text-red-200 border border-red-700/40 p-4 rounded-lg mb-6 flex items-start">
            <FaExclamationCircle className="text-red-400 mr-2 mt-1 flex-shrink-0" />
            <p className="text-left">{getErrorMessage()}</p>
          </div>

          {error?.stack && (
            <details className="mb-8 text-left bg-gray-900/50 p-4 rounded-lg border border-gray-700/40">
              <summary className="cursor-pointer text-gray-400 hover:text-gray-300 transition-colors">
                Szczegóły techniczne
              </summary>
              <pre className="mt-2 text-xs text-gray-400 overflow-auto p-2">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary flex items-center justify-center"
            >
              <FaHome className="mr-2" />
              Strona główna
            </Link>

            <button
              onClick={() => {
                if (navigate) {
                  navigate(0); // Odświeża aktualną stronę
                } else {
                  window.location.reload();
                }
              }}
              className="btn-secondary flex items-center justify-center"
            >
              <FaRedo className="mr-2" />
              Odśwież stronę
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
