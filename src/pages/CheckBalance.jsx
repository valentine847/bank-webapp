import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function CheckBalance() {
  const { fetchBankAccounts } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accs = await fetchBankAccounts();
        setAccounts(accs);
      } catch (err) {
        setError("Failed to load account balances");
      }
    };
    loadAccounts();
  }, [fetchBankAccounts]);

  return (
    <div className="page-center">
      <div className="form-card">
        <h2>💳 Check Account Balances</h2>
        {error && <div className="error">{error}</div>}

        <div className="accounts">
          {accounts.length > 0 ? (
            accounts.map((acc) => (
              <div key={acc.accountNumber} className="account">
                <span>
                  <strong>{acc.accountType}</strong> ({acc.accountNumber})
                </span>
                <span>Balance: Ksh {acc.balance.toFixed(2)}</span>
              </div>
            ))
          ) : (
            <p className="muted">No accounts found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
