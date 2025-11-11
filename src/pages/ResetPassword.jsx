import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ResetPassword() {
  const { resetPasswordUnified } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // ✅ added
  const { method, email, phoneNumber } = location.state || {};

  const [token, setToken] = useState(""); // for email
  const [otp, setOtp] = useState(""); // for sms
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!method) return <p>Error: No reset method provided. Go back to forgot password page.</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword) return setError("Enter a new password.");
    if (method === "email" && !token) return setError("Enter token from email.");
    if (method === "sms" && !otp) return setError("Enter OTP from SMS.");

    setLoading(true);
    try {
      const res = await resetPasswordUnified({
        email: method === "email" ? email : null,
        phoneNumber: method === "sms" ? phoneNumber : null,
        token: method === "email" ? token : null,
        otp: method === "sms" ? otp : null,
        newPassword,
      });

      setMessage(res?.message || "Password reset successfully!");

      // ✅ Redirect to login page after 1 second
      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Reset Password ({method.toUpperCase()})</h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {message && <p className="text-green-600 mb-3">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {method === "email" && (
          <input
            type="text"
            placeholder="Token from Email"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        )}

        {method === "sms" && (
          <input
            type="text"
            placeholder="OTP from SMS"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        )}

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
