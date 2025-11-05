import React from "react";
import { Link } from "react-router-dom";
export default function Home() {
  return (
    <div className="card">
      <h2>Welcome to BankWeb </h2>
      <p>Start by logging in or creating an account.</p>
      <div style={{ marginTop: 12 }}>
        <Link className="btn" to="/register">Create an account</Link>
        <Link className="btn outline" to="/login" style={{ marginLeft: 8 }}>I already have an account</Link>
      </div>
    </div>
  );
}
