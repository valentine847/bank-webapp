import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

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
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");
    setSuccess("");

    // Basic validation
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
          headers: { "Content-Type": "application/json" },
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

      // Await response but do not assign to avoid ESLint warning
      await response.json();

      setSuccess("✅ Registration successful! Redirecting to login...");
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
        {[
          { label: "First Name", name: "firstName", type: "text" },
          { label: "Last Name", name: "lastName", type: "text" },
          { label: "Username", name: "username", type: "text" },
          { label: "Email Address", name: "email", type: "email" },
          { label: "Phone Number", name: "phoneNumber", type: "tel" },
          { label: "National ID", name: "nationalId", type: "text" },
          { label: "Date of Birth", name: "dateOfBirth", type: "date" },
          { label: "Password", name: "password", type: "password" },
          { label: "Confirm Password", name: "confirmPassword", type: "password" },
        ].map((field) => (
          <div key={field.name} className="form-group">
            <label>{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              placeholder={field.type !== "date" ? `Enter ${field.label.toLowerCase()}` : ""}
              value={formData[field.name]}
              onChange={handleChange}
            />
          </div>
        ))}

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
