import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function FetchAccounts() {
  const { fetchBankAccounts, user, loading } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);

  const ACCOUNT_TYPE_NAMES = {
    savings: "Savings Account",
    checking: "Checking Account",
    junior: "Junior Account",
    1: "Savings Account",
    2: "Checking Account",
    3: "Junior Account",
  };

  useEffect(() => {
    const loadAccounts = async () => {
      if (!user?.customerId) {
        setError("⚠️ Please log in to view your accounts.");
        return;
      }

      try {
        const res = await fetchBankAccounts(user.customerId);
        console.log("📦 Full backend response:", res);

        // ✅ FIX: handle direct array response
        if (Array.isArray(res)) {
          setAccounts(res);
          console.log("✅ Extracted accounts:", res);
        } else if (res?.data && Array.isArray(res.data)) {
          setAccounts(res.data);
        } else if (res?.data?.accounts && Array.isArray(res.data.accounts)) {
          setAccounts(res.data.accounts);
        } else {
          setError("⚠️ No valid account data found.");
        }
      } catch (err) {
        console.error("❌ Error fetching accounts:", err);
        setError("⚠️ Could not fetch accounts. Check console for details.");
      }
    };

    loadAccounts();
  }, [user]);

  const formatAccountType = (typeValue) => {
    if (!typeValue) return "Unknown Type";
    const normalized = String(typeValue).toLowerCase().trim();
    return ACCOUNT_TYPE_NAMES[normalized] || "Unknown Type";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          🏦 Your Bank Accounts
        </h2>

        {loading && (
          <p className="text-center text-gray-600">Loading accounts...</p>
        )}
        {error && (
          <p className="text-center text-red-600 font-medium mb-4">{error}</p>
        )}

        {!loading && !error && accounts.length === 0 && (
          <p className="text-center text-gray-600">No accounts found.</p>
        )}

        {!loading && accounts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-blue-100 text-blue-800">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">
                    Account Number
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Account Type
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account, index) => (
                  <tr
                    key={index}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="py-2 px-4">{account.accountNumber}</td>
                    <td className="py-2 px-4">
                      {formatAccountType(account.accountType)}
                    </td>
                    <td className="py-2 px-4 font-medium text-green-700">
                      ${Number(account.balance || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
