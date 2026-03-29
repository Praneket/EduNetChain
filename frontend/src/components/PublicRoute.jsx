import React from "react";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "alumni") return <Navigate to="/alumni" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
