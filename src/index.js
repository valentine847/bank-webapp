import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx"; // ✅ make sure the filename matches
import { AuthProvider } from "./contexts/AuthContext.jsx"; // ✅ add .jsx for clarity
import "./index.css"; //import Tailwind styles here

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found! Make sure your index.html has <div id='root'></div>");
}
