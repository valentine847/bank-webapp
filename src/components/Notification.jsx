import React from "react";

export default function Notification({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded shadow-md transition-all duration-300 ${
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 font-bold text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
}
