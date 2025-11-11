import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user: authUser, fetchBankAccounts } = useAuth();
  const [user, setUser] = useState(authUser);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Update user state if localStorage changes
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, [authUser]);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await fetchBankAccounts();
        setAccounts(data);
      } catch (err) {
        setError("Failed to load accounts.");
      } finally {
        setLoading(false);
      }
    };
    loadAccounts();
  }, [fetchBankAccounts]);

  const handleDeposit = (accountNumber) => {
    navigate("/deposit", { state: { accountNumber, returnToDashboard: true } });
  };

  const handleWithdraw = (accountNumber) => {
    navigate("/withdraw", { state: { accountNumber, returnToDashboard: true } });
  };

  const handleTransfer = (accountNumber) => {
    navigate("/transfer-funds", { state: { fromAccount: accountNumber, returnToDashboard: true } });
  };

  const handleViewStatement = (accountNumber) => {
    navigate("/transaction-statement", { state: { accountNumber } });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Welcome, {user?.name || user?.username || "User"}! 🌟
      </h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <p className="text-gray-500">No accounts found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div
              key={acc.accountNumber}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                Account Number
              </h2>
              <p className="text-gray-900 text-xl font-bold mb-4">
                {acc.accountNumber}
              </p>

              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                Balance
              </h2>
              <p className="text-green-600 text-xl font-bold mb-4">
                ${acc.balance?.toFixed(2) || "0.00"}
              </p>

              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => handleDeposit(acc.accountNumber)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors duration-300"
                >
                  Deposit
                </button>

                <button
                  onClick={() => handleWithdraw(acc.accountNumber)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors duration-300"
                >
                  Withdraw
                </button>

                <button
                  onClick={() => handleTransfer(acc.accountNumber)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded transition-colors duration-300"
                >
                  Transfer
                </button>

                <button
                  onClick={() => handleViewStatement(acc.accountNumber)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded transition-colors duration-300"
                >
                  Statement
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
