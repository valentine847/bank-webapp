import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Deposit() {
  const { fetchBankAccounts, deposit } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Pre-select account if passed from Dashboard
  const preSelectedAccount = location.state?.accountNumber || "";

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accs = await fetchBankAccounts();
        setAccounts(accs);
        if (preSelectedAccount) setAccountNumber(preSelectedAccount);
      } catch {
        setError("Failed to load accounts");
      }
    };
    loadAccounts();
  }, [fetchBankAccounts, preSelectedAccount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!accountNumber || !amount) {
      setError("Please select an account and enter an amount.");
      return;
    }

    try {
      setLoading(true);
      const res = await deposit(accountNumber, parseFloat(amount));
      setMessage(`✅ ${res.message || "Deposit successful!"}`);

      // Refresh accounts
      const updated = await fetchBankAccounts();
      setAccounts(updated);
      setAmount("");

      // ✅ Redirect back to Dashboard after success
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Deposit failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">💰 Deposit Funds</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Select Account</label>
          <select
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose Account --</option>
            {accounts.map((acc) => (
              <option key={acc.accountNumber} value={acc.accountNumber}>
                {acc.accountType} — {acc.accountNumber} — Balance: ${acc.balance.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Amount</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter deposit amount"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-300 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Processing..." : "Deposit"}
        </button>
      </form>
    </div>
  );
}
