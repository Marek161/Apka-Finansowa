// Importowanie niezbędnych funkcji z pakietów Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Dodaj SDK dla produktów Firebase, których chcesz używać
// https://firebase.google.com/docs/web/setup#available-libraries

// Konfiguracja Firebase dla twojej aplikacji
// Dla Firebase JS SDK w wersji 7.20.0 i późniejszych, parametr measurementId jest opcjonalny
const firebaseConfig = {
  apiKey: "AIzaSyD5KcI_N6pgTSpehHgEa2humrHg5oD-ubM",
  authDomain: "aplikacja-finansowa-747ca.firebaseapp.com",
  projectId: "aplikacja-finansowa-747ca",
  storageBucket: "aplikacja-finansowa-747ca.firebasestorage.app",
  messagingSenderId: "954030972041",
  appId: "1:954030972041:web:2565aed9855d7b40057a58",
  measurementId: "G-7YTK0CG61L",
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
export default app;
