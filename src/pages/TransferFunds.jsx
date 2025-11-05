import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function TransferFunds() {
  const { fetchBankAccounts, transferFunds } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const preFromAccount = location.state?.fromAccount || "";

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await fetchBankAccounts();
        setAccounts(data);
        if (preFromAccount) setFromAccount(preFromAccount);
      } catch (err) {
        setError("Failed to load accounts.");
        console.error(err);
      }
    };
    loadAccounts();
  }, [fetchBankAccounts, preFromAccount]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!fromAccount || !toAccount || !amount) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await transferFunds(fromAccount, toAccount, parseFloat(amount));
      setSuccess(`✅ Successfully transferred $${amount} from ${fromAccount} to ${toAccount}`);
      setAmount("");
      setToAccount("");

      // ✅ Redirect back to Dashboard after success
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Transfer failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Transfer Funds</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <form onSubmit={handleTransfer} className="space-y-4">
        {/* From Account */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">From Account</label>
          <input
            list="userAccounts"
            value={fromAccount}
            onChange={(e) => setFromAccount(e.target.value)}
            placeholder="Select or type your account number"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <datalist id="userAccounts">
            {accounts.map((acc) => (
              <option key={acc.accountNumber} value={acc.accountNumber}>
                {acc.accountNumber} - {acc.accountType} — Balance: ${acc.balance?.toFixed(2)}
              </option>
            ))}
          </datalist>
          <p className="text-sm text-gray-500 mt-1">You can type or select from your accounts.</p>
        </div>

        {/* To Account */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">To Account</label>
          <input
            type="text"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            placeholder="Enter recipient's account number"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Amount</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
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
          {loading ? "Transferring..." : "Transfer Funds"}
        </button>
      </form>
    </div>
  );
}
