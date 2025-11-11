import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* === Left: Brand === */}
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          💰 BankWeb
        </Link>
      </div>

      {/* === Right: Links === */}
      <div className="navbar-right">
        {!user ? (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link primary">
              Register
            </Link>
          </>
        ) : (
          <>
            {/* Dashboard */}
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>

            <span className="nav-divider" />

            {/* Accounts */}
            <Link to="/create-account" className="nav-link">
              Create Account
            </Link>
            <Link to="/fetch-accounts" className="nav-link">
              My Accounts
            </Link>

            <span className="nav-divider" />

            {/* Banking Actions */}
            <div className="nav-group">
              <Link to="/deposit" className="nav-link">
                Deposit
              </Link>
              <Link to="/withdraw" className="nav-link">
                Withdraw
              </Link>
              <Link to="/transfer-funds" className="nav-link">
                Transfer Funds
              </Link>
              <Link to="/overdraft" className="nav-link">
                Request Overdraft
              </Link>
              <Link to="/check-balance" className="nav-link">
                Check Balance
              </Link>
              <Link to="/transaction-statement" className="nav-link">
                Transactions
              </Link>

              {/* Update Password Link */}
              <Link to="/update-password" className="nav-link">
                Update Password 🔒
              </Link>
            </div>

            <span className="nav-divider" />

            {/* Logout */}
            <button onClick={handleLogout} className="btn small logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
