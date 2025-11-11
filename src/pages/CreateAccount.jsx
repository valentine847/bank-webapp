import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function CreateAccount() {
  const { createBankAccount, fetchAccountTypes, user, loading } = useAuth();

  const [accountTypes, setAccountTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [createdAccount, setCreatedAccount] = useState(null);

  useEffect(() => {
    const loadTypes = async () => {
      const types = await fetchAccountTypes();
      setAccountTypes(types);
    };
    loadTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const chosen = accountTypes.find(
      (t) => String(t.accountTypeId) === String(selectedType)
    );

    const payload = {
      customerId: String(user.customerId),
      accountType: chosen.accountType, // ✅ send string to backend
    };

    try {
      const res = await createBankAccount(payload);
      setCreatedAccount(res.data || res);
      setMessage({ text: "✅ Account created successfully!", type: "success" });
      setSelectedType("");
    } catch {
      setMessage({ text: "❌ Failed to create account.", type: "error" });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Create Bank Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="p-2 border rounded-md w-full"
          required
        >
          <option value="">-- Select Account Type --</option>
          {accountTypes.map((t) => (
            <option key={t.accountTypeId} value={t.accountTypeId}>
              {t.accountType}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      {message.text && (
        <p className={`mt-4 text-center ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      {createdAccount && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <p><strong>Account Number:</strong> {createdAccount.accountNumber}</p>
          <p><strong>Type:</strong> {createdAccount.accountType}</p>
        </div>
      )}
    </div>
  );
}
