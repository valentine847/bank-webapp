// src/pages/TransactionStatement.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function TransactionStatement() {
  const { user, fetchBankAccounts } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = "https://bank-j2ix.onrender.com";

  // Optional mapping for account type IDs
  const accountTypeMap = {
    0: "Savings",
    1: "Checking",
    2: "Business",
  };

  // Fetch user's accounts on mount
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await fetchBankAccounts();
        setAccounts(data);
        if (data.length > 0) setSelectedAccount(data[0].accountNumber);
      } catch (err) {
        setError("Failed to load accounts.");
      }
    };
    loadAccounts();
  }, [fetchBankAccounts]);

  // Fetch transaction statements
  const fetchStatement = async () => {
    if (!selectedAccount) return;
    setLoading(true);
    setError("");
    setTransactions([]);
    try {
      const token = user?.token || localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/account/${selectedAccount}/statement`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to fetch statement: ${res.status}`);

      const data = await res.json();
      setTransactions(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error fetching statement.");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Transaction Statement</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <select
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
        >
          {accounts.map((acc) => (
            <option key={acc.accountNumber} value={acc.accountNumber}>
              {acc.accountNumber} - {acc.accountType}
            </option>
          ))}
        </select>
        <button
          onClick={fetchStatement}
          className={`px-6 py-2 rounded text-white font-medium ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          } transition-colors duration-300`}
          disabled={loading}
        >
          {loading ? "Fetching..." : "View Statement"}
        </button>
      </div>

      {transactions.length > 0 ? (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {accountTypeMap[tx.accountTypeId] || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {tx.transactionCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {tx.transactionType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    {tx.amount?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {tx.fromAccount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {tx.toAccount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(tx.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-gray-500">No transactions to display.</p>
      )}
    </div>
  );
}
