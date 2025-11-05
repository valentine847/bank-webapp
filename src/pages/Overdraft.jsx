import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function RequestOverdraft() {
  const { fetchBankAccounts } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accs = await fetchBankAccounts();
        setAccounts(accs);
      } catch {
        setError("Failed to load accounts");
      }
    };
    loadAccounts();
  }, [fetchBankAccounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!accountNumber || !amount) {
      setError("Please select an account and enter an amount.");
      return;
    }

    setMessage(`✅ Overdraft request of Ksh ${amount} submitted successfully!`);
    setError("");
    setAmount("");
    setAccountNumber("");
  };

  return (
    <div className="page-center">
      <div className="form-card">
        <h2>📨 Request Overdraft</h2>

        {error && <div className="error">{error}</div>}
        {message && <div className="success-msg">{message}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Select Account</label>
            <select
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            >
              <option value="">-- Choose Account --</option>
              {accounts.map((acc) => (
                <option key={acc.accountNumber} value={acc.accountNumber}>
                  {acc.accountType} — {acc.accountNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Requested Amount</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter overdraft amount"
            />
          </div>

          <button type="submit" className="btn">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
