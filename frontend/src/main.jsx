import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "leaflet/dist/leaflet.css";
import "./styles/global.css";
console.log("ENV:", import.meta.env);
console.log("KEY:", import.meta.env.VITE_ORS_API_KEY);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);