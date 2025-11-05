import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>No user logged in</p>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Profile</h2>
      <div style={styles.card}>
        <p><strong>Customer ID:</strong> {user.customerId}</p>
        <p><strong>Full Name:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phoneNumber}</p>
        <p><strong>National ID:</strong> {user.nationalId}</p>
        <p><strong>Date of Birth:</strong> {user.dateOfBirth}</p>
        <p><strong>Username:</strong> {user.username}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    marginBottom: "1rem",
  },
  card: {
    background: "#f5f5f5",
    padding: "1.5rem",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    width: "350px",
    lineHeight: "1.6",
  },
};
