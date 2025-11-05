// src/components/DashboardCard.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function DashboardCard({ account }) {
  const { deposit, withdraw, fetchBankAccounts } = useAuth();
  const [amount, setAmount] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState("");

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setMessage("⚠️ Please enter a valid amount.");
      return;
    }

    setLoadingAction(true);
    try {
      console.log("Data=>",account)
      await deposit(account.accountNumber, Number(amount));
      setMessage("✅ Deposit successful!");
      setAmount("");
      await fetchBankAccounts(); // refresh after deposit
    } catch (err) {
      console.error("🚨 Deposit error:", err);
      setMessage("❌ Deposit failed. Check console for details.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setMessage("⚠️ Please enter a valid amount.");
      return;
    }

    setLoadingAction(true);
    try {
      await withdraw(account.accountNumber, Number(amount));
      setMessage("✅ Withdrawal successful!");
      setAmount("");
      await fetchBankAccounts();
    } catch (err) {
      console.error("🚨 Withdraw error:", err);
      setMessage("❌ Withdrawal failed. Check console for details.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl shadow-md bg-white mb-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-2 text-gray-800">
        {account?.accountType}
      </h2>
      <p className="text-gray-700 mb-1">
        <strong>Account Number:</strong> {account?.accountNumber}
      </p>
      <p className="text-gray-700 mb-3">
        <strong>Balance:</strong> Ksh {account?.balance}
      </p>

      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded-md p-2"
        />

        <div className="flex gap-3">
          <button
            onClick={handleDeposit}
            disabled={loadingAction}
            className={`bg-green-600 text-white px-3 py-2 rounded-md flex-1 hover:bg-green-700 ${
              loadingAction ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loadingAction ? "Processing..." : "Deposit"}
          </button>

          <button
            onClick={handleWithdraw}
            disabled={loadingAction}
            className={`bg-red-600 text-white px-3 py-2 rounded-md flex-1 hover:bg-red-700 ${
              loadingAction ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loadingAction ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </form>

      {message && (
        <p
          className={`mt-3 text-sm text-center font-medium ${
            message.includes("✅")
              ? "text-green-600"
              : message.includes("❌")
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
