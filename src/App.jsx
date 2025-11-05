import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// === Pages ===
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateAccount from "./pages/CreateAccount.jsx";
import FetchAccounts from "./pages/FetchAccounts.jsx";
import Deposit from "./pages/Deposit.jsx";
import Withdraw from "./pages/Withdraw.jsx";
import TransferFunds from "./pages/TransferFunds.jsx";
import Overdraft from "./pages/Overdraft.jsx";
import CheckBalance from "./pages/CheckBalance.jsx";
import TransactionStatement from "./pages/TransactionStatement.jsx"; // ✅ Added

// === Components ===
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// === Context ===
import { useAuth } from "./contexts/AuthContext.jsx";

// === Styles ===
import "./App.css";

export default function App() {
  const { user } = useAuth();

  return (
    <>
      {/* Navbar shown for all pages */}
      <Navbar />

      <main className="app-container">
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
          />

          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/dashboard" replace />}
          />

          {/* ===== PROTECTED ROUTES ===== */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-account"
            element={
              <ProtectedRoute>
                <CreateAccount />
              </ProtectedRoute>
            }
          />

          <Route
            path="/fetch-accounts"
            element={
              <ProtectedRoute>
                <FetchAccounts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/deposit"
            element={
              <ProtectedRoute>
                <Deposit />
              </ProtectedRoute>
            }
          />

          <Route
            path="/withdraw"
            element={
              <ProtectedRoute>
                <Withdraw />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transfer-funds"
            element={
              <ProtectedRoute>
                <TransferFunds />
              </ProtectedRoute>
            }
          />

          <Route
            path="/overdraft"
            element={
              <ProtectedRoute>
                <Overdraft />
              </ProtectedRoute>
            }
          />

          <Route
            path="/check-balance"
            element={
              <ProtectedRoute>
                <CheckBalance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transaction-statement" // ✅ New route
            element={
              <ProtectedRoute>
                <TransactionStatement />
              </ProtectedRoute>
            }
          />

          {/* ===== CATCH-ALL (404) ===== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
