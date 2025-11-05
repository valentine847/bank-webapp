import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Withdraw() {
  const { fetchBankAccounts, withdraw } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedAccount = location.state?.accountNumber || "";

  // Load accounts on mount
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accs = await fetchBankAccounts();
        const normalized = accs.map((acc) => ({
          ...acc,
          accountNumber: String(acc.accountNumber),
        }));
        setAccounts(normalized);
        if (preSelectedAccount) setAccountNumber(preSelectedAccount);
      } catch (err) {
        setError("Failed to fetch accounts.");
        console.error(err);
      }
    };
    loadAccounts();
  }, [fetchBankAccounts, preSelectedAccount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!accountNumber) {
      setError("Please select an account.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      await withdraw(String(accountNumber).trim(), Number(amount));
      setMessage("✅ Withdrawal successful!");

      // Refresh accounts
      const updated = await fetchBankAccounts();
      setAccounts(updated);
      setAmount("");

      // ✅ Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Withdrawal failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🏧 Withdraw Funds</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Select Account</label>
          <select
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">-- Choose Account --</option>
            {accounts.map((acc) => (
              <option key={acc.accountNumber} value={acc.accountNumber}>
                {acc.accountType} — {acc.accountNumber} — Balance: ${Number(acc.balance).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Amount (KES)</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter withdrawal amount"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition-colors duration-300 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Processing..." : "Withdraw"}
        </button>
      </form>
    </div>
  );
}
