import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function CreateAccount() {
  const { createBankAccount, user, loading } = useAuth();

  const [accountTypes, setAccountTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [createdAccount, setCreatedAccount] = useState(null);

  const BASE_URL = "https://bank-j2ix.onrender.com";

  const getAuthHeader = () => {
    const token = user?.token || localStorage.getItem("token");
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch account types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch(`${BASE_URL}/fetchAccountTypes`, {
          method: "GET",
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch account types: ${res.status}`);

        const data = await res.json();
        const backendTypes = Array.isArray(data) ? data : data.data || [];

        console.log("✅ Account types from backend:", backendTypes);
        setAccountTypes(backendTypes);
      } catch (err) {
        console.error("Error loading account types:", err);
        setMessage({ text: "Unable to load account types.", type: "warning" });
      }
    };

    fetchTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setCreatedAccount(null);

    if (!user?.customerId) {
      setMessage({ text: "Please log in first.", type: "error" });
      return;
    }

    if (!selectedType) {
      setMessage({ text: "Please select an account type.", type: "error" });
      return;
    }

    // Find the chosen account type object
    const chosenType = accountTypes.find(
      (t) => String(t.accountTypeId) === String(selectedType)
    );

    if (!chosenType) {
      console.error("❌ Invalid selected type:", selectedType);
      setMessage({ text: "Please select a valid account type.", type: "error" });
      return;
    }

    const payload = {
      customerId: String(user.customerId),
      accountType: chosenType.accountType, // e.g., "SAVINGS", "CURRENT", "JUNIOR"
    };

    console.log("📦 Payload sent to backend:", payload);

    try {
      const res = await createBankAccount(payload);
      const accountData = res?.data || res;

      setCreatedAccount({
        accountNumber: accountData.accountNumber,
        accountType: accountData.accountType,
        balance: accountData.balance || 0,
      });

      setMessage({ text: "Account created successfully!", type: "success" });
      setSelectedType("");
    } catch (err) {
      console.error("🚨 Create Account error:", err);
      setMessage({ text: `Failed to create account: ${err.message}`, type: "error" });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Create Bank Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="accountType" className="mb-2 font-medium">
            Select Account Type
          </label>
          <select
            id="accountType"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">-- Select Account Type --</option>
            {accountTypes.map((type) => (
              <option key={type.accountTypeId} value={type.accountTypeId}>
                {type.accountType}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      {message.text && (
        <p
          className={`mt-4 p-2 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : message.type === "warning"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      {createdAccount && (
        <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="font-semibold text-lg mb-2">
            ✅ Account Created Successfully!
          </h3>
          <div className="flex justify-between">
            <span className="font-medium">Account Number:</span>
            <span>{createdAccount.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Account Type:</span>
            <span>{createdAccount.accountType}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Balance:</span>
            <span>${createdAccount.balance.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
