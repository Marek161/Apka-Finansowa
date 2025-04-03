import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// Usuwamy lub komentujemy tę linię:
// import reportWebVitals from './reportWebVitals';

// Tworzenie głównego korzenia aplikacji React i podłączenie go do elementu DOM o id 'root'
const root = ReactDOM.createRoot(document.getElementById("root"));

// Renderowanie głównego komponentu aplikacji w trybie rygorystycznym (StrictMode)
// StrictMode pomaga w identyfikacji potencjalnych problemów w aplikacji
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Usuwamy lub komentujemy wywołanie reportWebVitals():
// reportWebVitals();
