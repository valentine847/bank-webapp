import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/confirmationModal";
import Notification from "../components/Notification";

export default function Withdraw() {
  const { fetchBankAccounts, withdraw, getCharges } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionCost, setTransactionCost] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  const navigate = useNavigate();

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accs = await fetchBankAccounts();
        const formatted = accs.map(a => ({
          accountNumber: a.accountNumber,
          accountType: a.accountType,
          balance: a.balance ?? 0,
        }));
        setAccounts(formatted);
        if (formatted.length > 0) setFromAccount(formatted[0].accountNumber);
      } catch (err) {
        console.error("Account fetch error:", err);
        setNotification({ message: "Could not load accounts", type: "error" });
      }
    };
    loadAccounts();
  }, [fetchBankAccounts]);

  // Fetch transaction cost whenever amount changes
  useEffect(() => {
    const previewCharges = async () => {
      if (!amount) {
        setTransactionCost(0);
        return;
      }
      try {
        const cost = await getCharges(Number(amount), "withdraw");
        setTransactionCost(cost);
      } catch {
        setTransactionCost(0);
      }
    };
    previewCharges();
  }, [amount, getCharges]);

  const handleWithdraw = async () => {
    if (!fromAccount || !amount || Number(amount) <= 0) {
      setNotification({ message: "Select an account and enter a valid amount.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await withdraw({ fromAccount, amount: Number(amount) });
      setNotification({ message: `💸 Withdrawal of $${amount} successful!`, type: "success" });
      setAmount("");

      const updatedAccounts = await fetchBankAccounts();
      setAccounts(updatedAccounts);

      // Navigate back to dashboard after 1.5s
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Withdrawal error:", err);
      setNotification({ message: err.message || "Withdrawal failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const confirmWithdraw = (e) => {
    e.preventDefault();
    if (!fromAccount || !amount) {
      setNotification({ message: "Enter amount and select an account", type: "error" });
      return;
    }
    setShowModal(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    handleWithdraw();
  };

  const handleCancel = () => {
    setShowModal(false);
    setNotification({ message: "Withdrawal cancelled.", type: "error" });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">💸 Withdraw Funds</h2>

      <form onSubmit={confirmWithdraw} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Select Account</label>
          <select
            value={fromAccount}
            onChange={(e) => setFromAccount(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {accounts.map(acc => (
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
            placeholder="Enter withdrawal amount"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {transactionCost > 0 && (
          <p className="text-gray-600">Estimated transaction cost: ${transactionCost}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded bg-red-600 text-white font-medium hover:bg-red-700 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Processing..." : "Withdraw"}
        </button>
      </form>

      <ConfirmationModal
        isOpen={showModal}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="Confirm Withdrawal"
        message={`Withdraw $${amount} from account ${fromAccount}?\nTransaction cost: $${transactionCost}`}
      />

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "success" })}
      />
    </div>
  );
}
