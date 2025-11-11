import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmationModal from "../components/confirmationModal";
import Notification from "../components/Notification";

export default function Deposit() {
  const { fetchBankAccounts, deposit } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedAccount = location.state?.accountNumber || "";

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

        if (preSelectedAccount) setAccountNumber(preSelectedAccount);
        else if (formatted.length > 0) setAccountNumber(formatted[0].accountNumber);
      } catch (err) {
        console.error("Failed to load accounts:", err);
        setNotification({ message: "Failed to load accounts", type: "error" });
      }
    };
    loadAccounts();
  }, [fetchBankAccounts, preSelectedAccount]);

  // Deposit handler
  const handleDeposit = async () => {
    if (!accountNumber || !amount || Number(amount) <= 0) {
      setNotification({ message: "Please select an account and enter a valid amount.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await deposit(accountNumber, Number(amount));

      if (res?.message || res?.status?.startsWith("200") || res?.data) {
        setNotification({ message: `💰 Deposit of $${amount} successful!`, type: "success" });
        setAmount("");

        const updatedAccounts = await fetchBankAccounts();
        setAccounts(updatedAccounts);

        // Navigate back to dashboard after 1.5s
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        throw new Error(res?.error || "Deposit failed");
      }
    } catch (err) {
      console.error("Deposit error:", err);
      setNotification({ message: err.message || "Deposit failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeposit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    handleDeposit();
  };

  const handleCancel = () => {
    setShowModal(false);
    setNotification({ message: "Deposit cancelled.", type: "error" });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">💰 Deposit Funds</h2>

      <form onSubmit={confirmDeposit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Select Account</label>
          <select
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose Account --</option>
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

      <ConfirmationModal
        isOpen={showModal}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="Confirm Deposit"
        message={`Confirm deposit of $${amount} to account ${accountNumber}?`}
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
