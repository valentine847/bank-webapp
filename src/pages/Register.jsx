import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css"; // shared styles

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNumber: "",
    nationalId: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");
    setSuccess("");

    // basic validation
    if (Object.values(formData).some((field) => !field)) {
      setErrors("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://bank-j2ix.onrender.com/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            nationalId: formData.nationalId,
            dateOfBirth: formData.dateOfBirth,
            password: formData.password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed.");
      }

      const data = await response.json();

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrors(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card card">
      <h2>Create Your Account</h2>
      <p className="muted">Fill in the details to register your bank account</p>

      {errors && <div className="error">{errors}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit} className="form">
        {/* First Name */}
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        {/* Last Name */}
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        {/* Username */}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            placeholder="e.g. 0712345678"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>

        {/* National ID */}
        <div className="form-group">
          <label>National ID</label>
          <input
            type="text"
            name="nationalId"
            placeholder="Enter your national ID"
            value={formData.nationalId}
            onChange={handleChange}
          />
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="muted">
        Already have an account?{" "}
        <Link to="/login" className="link">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
