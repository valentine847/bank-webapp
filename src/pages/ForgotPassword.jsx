import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ForgotPassword() {
  const { forgotPasswordUnified } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState("email"); // "email" or "sms"
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (method === "email" && !email) return setError("Enter your email.");
    if (method === "sms" && !phoneNumber) return setError("Enter your phone number.");

    setLoading(true);
    try {
      const res = await forgotPasswordUnified({
        email: method === "email" ? email : null,
        phoneNumber: method === "sms" ? phoneNumber : null,
      });

      setMessage(res?.message || "Reset instructions sent!");

      // Navigate to Reset Password page with state
      navigate("/reset-password", {
        state: { method, email, phoneNumber },
      });
    } catch (err) {
      setError(err.message || "Failed to send reset instructions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>

      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="email"
            checked={method === "email"}
            onChange={() => setMethod("email")}
            className="mr-1"
          />
          Email
        </label>
        <label>
          <input
            type="radio"
            value="sms"
            checked={method === "sms"}
            onChange={() => setMethod("sms")}
            className="mr-1"
          />
          SMS
        </label>
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {message && <p className="text-green-600 mb-3">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {method === "email" && (
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        )}
        {method === "sms" && (
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Sending..." : "Send Reset Instructions"}
        </button>
      </form>
    </div>
  );
}
