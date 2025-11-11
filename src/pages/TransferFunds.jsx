import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/confirmationModal";
import Notification from "../components/Notification";

export default function TransferFunds() {
  const { fetchBankAccounts, transferFunds, getCharges } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionCost, setTransactionCost] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  const navigate = useNavigate();

  // Load accounts
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
        if (formatted.length > 1) setToAccount(formatted[1].accountNumber);
      } catch (err) {
        console.error("Failed to load accounts:", err);
        setNotification({ message: "Failed to load accounts", type: "error" });
      }
    };
    loadAccounts();
  }, [fetchBankAccounts]);

  // Update transaction cost whenever amount changes
  useEffect(() => {
    const previewCharges = async () => {
      if (!amount) {
        setTransactionCost(0);
        return;
      }
      try {
        const cost = await getCharges(Number(amount), "transfer");
        setTransactionCost(cost);
      } catch {
        setTransactionCost(0);
      }
    };
    previewCharges();
  }, [amount, getCharges]);

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount || !amount || Number(amount) <= 0) {
      return setNotification({ message: "Select accounts and enter a valid amount.", type: "error" });
    }
    if (fromAccount === toAccount) {
      return setNotification({ message: "Cannot transfer to the same account.", type: "error" });
    }

    setLoading(true);
    try {
      await transferFunds(fromAccount, toAccount, Number(amount));
      setNotification({ message: `🔁 Transfer of $${amount} successful!`, type: "success" });
      setAmount("");

      const updatedAccounts = await fetchBankAccounts();
      setAccounts(updatedAccounts);

      // Auto navigate back to dashboard after 1.5s
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Transfer error:", err);
      setNotification({ message: err.message || "Transfer failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const confirmTransfer = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    handleTransfer();
  };

  const handleCancel = () => {
    setShowModal(false);
    setNotification({ message: "Transfer cancelled.", type: "error" });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🔁 Transfer Funds</h2>

      <form onSubmit={confirmTransfer} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">From Account</label>
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
          <label className="block text-gray-700 font-medium mb-1">To Account</label>
          <select
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {accounts
              .filter(acc => acc.accountNumber !== fromAccount)
              .map(acc => (
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
            placeholder="Enter transfer amount"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {transactionCost > 0 && (
          <p className="text-gray-600">Estimated transaction cost: ${transactionCost}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Processing..." : "Transfer"}
        </button>
      </form>

      <ConfirmationModal
        isOpen={showModal}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="Confirm Transfer"
        message={`Transfer $${amount} from ${fromAccount} to ${toAccount}?\nTransaction cost: $${transactionCost}`}
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
