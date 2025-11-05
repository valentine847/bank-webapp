// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();
const BASE_URL = "https://bank-j2ix.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =====================================================
     🔹 Helper: Get Auth Header
  ===================================================== */
  const getAuthHeader = () => {
    const token = user?.token || localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /* =====================================================
     🔹 LOGIN FUNCTION
  ===================================================== */
  const login = async (usernameOrEmail, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      if (!res.ok) throw new Error("Login failed. Check credentials.");

      const data = await res.json();
      const userData = data.data || data;

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);
      localStorage.setItem("customerId", userData.customerId);

      setUser(userData);
      return userData;
    } catch (err) {
      console.error("🚨 Login error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🔹 LOGOUT FUNCTION
  ===================================================== */
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("customerId");
    setUser(null);
  };

  /* =====================================================
     🔹 FETCH ACCOUNT TYPES
  ===================================================== */
  const fetchAccountTypes = async () => {
    try {
      const res = await fetch(`${BASE_URL}/accountTypes`);
      if (!res.ok) throw new Error("Failed to load account types.");
      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.error("🚨 Error loading account types:", err);
      throw err;
    }
  };

  /* =====================================================
     🔹 FETCH BANK ACCOUNTS
  ===================================================== */
  const fetchBankAccounts = async (customerId) => {
    try {
      const id = customerId || user?.customerId || localStorage.getItem("customerId");
      if (!id) throw new Error("Missing customer ID.");

      const res = await fetch(`${BASE_URL}/customer/${id}/accounts`, {
        headers: getAuthHeader(),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`Failed to fetch accounts.`);

      const data = JSON.parse(text);
      return data.data || [];
    } catch (err) {
      console.error("🚨 Error fetching accounts:", err);
      throw new Error(err.message || "Failed to fetch accounts.");
    }
  };

  /* =====================================================
     🔹 CREATE BANK ACCOUNT
  ===================================================== */
  const createBankAccount = async (payload) => {
    try {
      const customerId = user?.customerId || localStorage.getItem("customerId");
      if (!customerId) throw new Error("Missing customer ID — please log in again.");

      const finalPayload = {
        customerId: String(customerId),
        accountType: payload.accountType,
      };

      const res = await fetch(`${BASE_URL}/createAccount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(finalPayload),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok) throw new Error(data?.message || "Failed to create account.");

      return data.data || data;
    } catch (err) {
      console.error("🚨 Create Account error:", err);
      throw new Error(err.message || "Failed to create account.");
    }
  };

  /* =====================================================
     💰 DEPOSIT FUNCTION
  ===================================================== */
  const deposit = async (toAccount, amount) => {
    try {
      const payload = { toAccount: String(toAccount).trim(), amount: Number(amount) };
      const res = await fetch(`${BASE_URL}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }

      if (!res.ok) throw new Error(data?.message || "Deposit failed. Please try again.");

      return data;
    } catch (err) {
      console.error("🚨 Deposit error:", err);
      throw new Error(err.message || "Deposit failed. Please try again.");
    }
  };

  /* =====================================================
     💸 WITHDRAW FUNCTION
  ===================================================== */
  const withdraw = async (fromAccount, amount) => {
    try {
      const payload = { fromAccount: String(fromAccount).trim(), amount: Number(amount) };
      const res = await fetch(`${BASE_URL}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }

      if (!res.ok) throw new Error(data?.message || "Withdrawal failed. Please try again.");

      return data;
    } catch (err) {
      console.error("🚨 Withdraw error:", err);
      throw new Error(err.message || "Withdrawal failed. Please try again.");
    }
  };

  /* =====================================================
     🔹 TRANSFER FUNDS
  ===================================================== */
  const transferFunds = async (fromAccount, toAccount, amount) => {
    try {
      const payload = {
        fromAccount: String(fromAccount).trim(),
        toAccount: String(toAccount).trim(),
        amount: Number(amount),
      };

      const res = await fetch(`${BASE_URL}/transferFunds`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }

      if (!res.ok) throw new Error(data?.message || "Transfer failed. Please try again.");

      return data;
    } catch (err) {
      console.error("🚨 Transfer error:", err);
      throw new Error(err.message || "Transfer failed. Please try again.");
    }
  };
/* =====================================================
   🔹 FETCH TRANSACTION COST
===================================================== */
const getTransactionCost = async (type, amount) => {
  try {
    const payload = { type, amount: Number(amount) };
    const res = await fetch(`${BASE_URL}/admin/updateTransactionCosts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text);

    const data = JSON.parse(text);
    return data?.cost || 0; // assuming the API returns { cost: number }
  } catch (err) {
    console.error("🚨 Transaction cost error:", err);
    return 0; // fallback to zero
  }
};

  /* =====================================================
     🔹 PROVIDER VALUE
  ===================================================== */
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        fetchAccountTypes,
        fetchBankAccounts,
        createBankAccount,
        deposit,
        withdraw,
        transferFunds,
        getTransactionCost,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
