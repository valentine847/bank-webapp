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
  const [fees, setFees] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedAccount = location.state?.accountNumber || "";
  const BASE_URL = "https://bank-j2ix.onrender.com";

  // Load accounts + fees
  useEffect(() => {
    const loadData = async () => {
      try {
        const accs = await fetchBankAccounts();
        setAccounts(accs);

        // Pre-select account if redirected from dashboard
        if (preSelectedAccount) setAccountNumber(preSelectedAccount);

        // Fetch transaction fee settings
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/transactionCosts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFees(data.data || data);
      } catch (err) {
        console.error(err);
        setError("Failed to load account or fees.");
      }
    };
    loadData();
  }, [fetchBankAccounts, preSelectedAccount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!accountNumber || !amount || Number(amount) <= 0) {
      setError("Please enter valid details.");
      return;
    }

    setConfirmPopup(true); // ✅ Show confirm popup first
  };

  const confirmWithdrawal = async () => {
    try {
      setLoading(true);
      const totalDeduction = Number(amount) + Number(fees.withdrawFee || 0);

      await withdraw(String(accountNumber).trim(), totalDeduction);
      setMessage("✅ Withdrawal successful!");

      navigate("/dashboard"); // ✅ return to dashboard
    } catch (err) {
      console.error(err);
      setError(err.message || "Withdrawal failed.");
    } finally {
      setLoading(false);
      setConfirmPopup(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🏧 Withdraw Funds</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}

      {/* ✅ Withdrawal Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Select Account</label>
          <select
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="">-- Choose Account --</option>
            {accounts.map((acc) => (
              <option key={acc.accountNumber} value={acc.accountNumber}>
                {acc.accountType} — {acc.accountNumber} — Balance: KES{" "}
                {Number(acc.balance).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Amount (KES)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter withdrawal amount"
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 rounded bg-red-600 text-white font-medium hover:bg-red-700"
        >
          {loading ? "Processing..." : "Withdraw"}
        </button>
      </form>

      {/* ✅ Confirmation Popup */}
      {confirmPopup && fees && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-5 rounded shadow-lg text-center max-w-sm">
            <h3 className="text-lg font-semibold mb-3">Confirm Withdrawal</h3>
            <p>Amount: <strong>KES {amount}</strong></p>
            <p>Fee: <strong>KES {fees.withdrawFee}</strong></p>
            <p className="mt-2">Total Deduction: <strong>KES {Number(amount) + Number(fees.withdrawFee)}</strong></p>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setConfirmPopup(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmWithdrawal}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
