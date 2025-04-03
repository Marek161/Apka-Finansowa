// Serwis do obsługi synchronizacji z Google Calendar
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Konfiguracja Google Calendar API
const GOOGLE_CALENDAR_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CALENDAR_CLIENT_ID;
const GOOGLE_CALENDAR_SCOPES =
  "https://www.googleapis.com/auth/calendar.events";

// Funkcja do synchronizacji transakcji z Google Calendar
export const syncWithGoogleCalendar = async (userId) => {
  try {
    // Pobieranie przyszłych transakcji użytkownika
    const transactionsRef = collection(db, "transactions");
    const q = query(
      transactionsRef,
      where("userId", "==", userId),
      where("date", ">=", new Date().toISOString())
    );

    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Konwersja transakcji na wydarzenia kalendarza
    const events = transactions.map((transaction) => ({
      summary: `${transaction.type === "expense" ? "Płatność" : "Przychód"}: ${transaction.category}`,
      description: transaction.notes || "",
      start: {
        dateTime: new Date(transaction.date).toISOString(),
        timeZone: "Europe/Warsaw",
      },
      end: {
        dateTime: new Date(
          new Date(transaction.date).getTime() + 3600000
        ).toISOString(),
        timeZone: "Europe/Warsaw",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // Przypomnienie dzień wcześniej
          { method: "popup", minutes: 60 }, // Przypomnienie godzinę wcześniej
        ],
      },
    }));

    // Wysłanie wydarzeń do Google Calendar
    await Promise.all(
      events.map((event) =>
        fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("googleAccessToken")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
          }
        )
      )
    );

    return true;
  } catch (error) {
    console.error("Błąd podczas synchronizacji z Google Calendar:", error);
    throw error;
  }
};

// Funkcja do autoryzacji z Google Calendar
export const authorizeGoogleCalendar = () => {
  const redirectUri = `${window.location.origin}/google-calendar-callback`;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CALENDAR_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(GOOGLE_CALENDAR_SCOPES)}&access_type=offline&prompt=consent`;

  window.location.href = authUrl;
};
