import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Statement() {
  const { getAccountStatement } = useAuth();
  const [accountNumber, setAccountNumber] = useState("");
  const [records, setRecords] = useState([]);

  async function load() {
    setRecords(await getAccountStatement(accountNumber));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Account Statement</h1>

      <input
        className="border p-2 rounded w-full mb-4"
        placeholder="Enter Account Number"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
      />

      <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">
        Fetch Statement
      </button>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Date</th>
            <th className="p-2">Type</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Balance</th>
          </tr>
        </thead>
        <tbody>
          {records.map((t, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{t.date}</td>
              <td className="p-2">{t.transactionType}</td>
              <td className="p-2">{t.amount}</td>
              <td className="p-2">{t.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
