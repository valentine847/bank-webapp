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

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  // LOGIN
  const login = async (usernameOrEmail, password) => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    if (!res.ok) throw new Error("Invalid Login Credentials");

    const data = await res.json();
    const userData = data.data;
    const token = userData.token;

    setUser(userData);
    setToken(token);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    return userData;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };

  // FETCH ACCOUNTS
  const fetchBankAccounts = async (customerId) => {
    const stored = JSON.parse(localStorage.getItem("user"));
    customerId = customerId || stored?.customerId;
    if (!customerId) throw new Error("Customer ID not found");

    const res = await fetch(`${BASE_URL}/customer/${customerId}/accounts`, {
      headers: getAuthHeader(),
    });
    const data = await res.json();
    return data.data;
  };

  const fetchAccountTypes = async () => {
    const res = await fetch(`${BASE_URL}/fetchAccountTypes`, { headers: getAuthHeader() });
    const data = await res.json();
    return data.data;
  };

  // DEPOSIT
  const deposit = async (toAccount, amount) => {
    const res = await fetch(`${BASE_URL}/deposit`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify({ toAccount, amount: Number(amount) }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || "Deposit failed");
    }

    return res.json();
  };

  // WITHDRAW
  const withdraw = async ({ fromAccount, amount }) => {
    const res = await fetch(`${BASE_URL}/withdraw`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify({ fromAccount, amount: Number(amount) }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || "Withdraw failed");
    }

    return res.json();
  };

  // GET CHARGES
  const getCharges = async (amount, type) => {
    try {
      const res = await fetch(`${BASE_URL}/charges?amount=${Number(amount)}&type=${type}`, {
        headers: getAuthHeader(),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || "Failed to load charges");
      }

      const data = await res.json();
      return data?.data?.transactionCost ?? 0;
    } catch {
      return 0;
    }
  };

  // TRANSFER
  const transferFunds = async (fromAccount, toAccount, amount) => {
    const res = await fetch(`${BASE_URL}/transferFunds`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify({ fromAccount, toAccount, amount: Number(amount) }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || "Transfer failed");
    }

    return res.json();
  };

  // STATEMENTS
  const getAccountStatement = async (accountNumber) => {
    const res = await fetch(`${BASE_URL}/account/${accountNumber}/statement`, {
      headers: getAuthHeader(),
    });
    const data = await res.json();
    return data.data;
  };

  // ----------------------------
  // PASSWORD RESET (EMAIL OR SMS)
  // ----------------------------

  const forgotPasswordUnified = async ({ email, phoneNumber }) => {
    if (!email && !phoneNumber) throw new Error("Provide email or phone number");
    const payload = email ? { email } : { phoneNumber };

    const res = await fetch(`${BASE_URL}/forgotPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || "Failed to send password reset instructions");
    }

    return res.json();
  };

  const resetPasswordUnified = async ({ email, phoneNumber, token, otp, newPassword }) => {
    let payload;
    if (email) payload = { email, token, newPassword };
    else if (phoneNumber) payload = { phoneNumber, otp, newPassword };
    else throw new Error("Provide email or phone number");

    const res = await fetch(`${BASE_URL}/resetPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || "Failed to reset password");
    }

    return res.json();
  };
  
// ----------------------------
// UPDATE PASSWORD (LOGGED-IN USER)
// ----------------------------
const updatePassword = async ({ usernameOrEmail, oldPassword, newPassword, confirmPassword }) => {
  if (!usernameOrEmail || !oldPassword || !newPassword || !confirmPassword) {
    throw new Error("All fields are required");
  }

  const res = await fetch(`${BASE_URL}/updatePassword`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` // optional, if your API needs auth
    },
    body: JSON.stringify({ usernameOrEmail, oldPassword, newPassword, confirmPassword }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to update password");
  }

  return res.json();
};


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        fetchBankAccounts,
        fetchAccountTypes,
        deposit,
        withdraw,
        transferFunds,
        getCharges,
        getAccountStatement,
        forgotPasswordUnified,
        resetPasswordUnified,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
