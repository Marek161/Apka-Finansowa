// Komponent do obsługi callbacku po autoryzacji Google Calendar
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleCalendarCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        try {
          // Wymiana kodu na token dostępu
          const tokenResponse = await fetch(
            "https://oauth2.googleapis.com/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                code,
                client_id: process.env.REACT_APP_GOOGLE_CALENDAR_CLIENT_ID,
                client_secret:
                  process.env.REACT_APP_GOOGLE_CALENDAR_CLIENT_SECRET,
                redirect_uri: `${window.location.origin}/google-calendar-callback`,
                grant_type: "authorization_code",
              }),
            }
          );

          const tokenData = await tokenResponse.json();
          localStorage.setItem("googleAccessToken", tokenData.access_token);
          localStorage.setItem("googleRefreshToken", tokenData.refresh_token);

          // Przekierowanie z powrotem do dashboardu
          navigate("/dashboard");
        } catch (error) {
          console.error("Błąd podczas autoryzacji:", error);
          navigate("/dashboard", {
            state: {
              error: "Wystąpił błąd podczas autoryzacji Google Calendar",
            },
          });
        }
      } else {
        navigate("/dashboard", {
          state: {
            error: "Nie otrzymano kodu autoryzacji",
          },
        });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Autoryzacja Google Calendar
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Proszę czekać, trwa przetwarzanie autoryzacji...
        </p>
      </div>
    </div>
  );
};

export default GoogleCalendarCallback;
