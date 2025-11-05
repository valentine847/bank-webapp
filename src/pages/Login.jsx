import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../App.css";

export default function Login() {
  const { login, error: authError, loading, user } = useAuth();
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (user?.token && user?.customerId) {
      console.log("✅ User already logged in, redirecting...");
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.usernameOrEmail.trim()) {
      setError("Please enter your username or email");
      return;
    }

    if (!form.password) {
      setError("Please enter your password");
      return;
    }

    try {
      const data = await login(form.usernameOrEmail.trim(), form.password);

      if (data && data.token && data.customerId) {
        console.log("✅ Login successful:", {
          customerId: data.customerId,
          hasToken: !!data.token,
        });

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      } else {
        setError("Invalid username/email or password.");
      }
    } catch (err) {
      console.error("🚨 Login error:", err);
      setError(err.message || "Something went wrong during login.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card form-card">
        <h2>Welcome Back 👋</h2>
        <p className="muted">Login to access your BankWeb account</p>

        {(error || authError) && (
          <div className="error-msg">{error || authError}</div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Username or Email</label>
            <input
              name="usernameOrEmail"
              type="text"
              value={form.usernameOrEmail}
              onChange={handleChange}
              placeholder="Enter your username or email"
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="muted">Don't have an account?</p>
          <Link to="/register" className="btn small">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
