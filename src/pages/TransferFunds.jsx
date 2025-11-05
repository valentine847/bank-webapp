import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TransferFunds() {
  const { fetchBankAccounts, transferFunds } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fees, setFees] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = "https://bank-j2ix.onrender.com";

  useEffect(() => {
    const loadData = async () => {
      try {
        const accs = await fetchBankAccounts();
        setAccounts(accs);

        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/transactionCosts`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        setFees(data.data || data);
      } catch (err) {
        console.error(err);
        setError("Failed to load accounts or fees.");
      }
    };
    loadData();
  }, [fetchBankAccounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!fromAccount || !toAccount || !amount || fromAccount === toAccount) {
      setError("Please enter valid transfer details.");
      return;
    }

    setConfirmPopup(true);
  };

  const confirmTransfer = async () => {
    try {
      setLoading(true);

      // ✅ Send only the AMOUNT to backend (fee is deducted server-side)
      await transferFunds(fromAccount, toAccount, Number(amount));

      setMessage("✅ Transfer successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Transfer failed.");
    } finally {
      setLoading(false);
      setConfirmPopup(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">💸 Transfer Funds</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">From Account</label>
          <select
            value={fromAccount}
            onChange={(e) => setFromAccount(e.target.value)}
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
          <label className="block text-gray-700 font-medium mb-1">To Account</label>
          <input
            type="text"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            placeholder="Enter recipient account number"
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Amount (KES)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter transfer amount"
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          {loading ? "Processing..." : "Transfer"}
        </button>
      </form>

      {/* Confirmation Popup */}
      {confirmPopup && fees && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">

            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Confirm Transfer
            </h3>

            <p className="flex justify-between text-gray-700">
              <span>Amount:</span>
              <span className="font-semibold">KES {amount}</span>
            </p>

            <p className="flex justify-between text-gray-700">
              <span>Transfer Fee:</span>
              <span className="font-semibold">KES {fees.transferFee}</span>
            </p>

            <p className="flex justify-between text-lg font-bold text-gray-900 mt-4">
              <span>Total Deduction:</span>
              <span>KES {Number(amount) + Number(fees.transferFee)}</span>
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setConfirmPopup(false)}
                className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={confirmTransfer}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Confirm Transfer
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
