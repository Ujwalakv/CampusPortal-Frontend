import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute enforces that a user is authenticated and optionally has the required role.
 * Reads `token` and `role` from localStorage.
 * Usage: <ProtectedRoute allowedRole="ADMIN"><AdminDashboard/></ProtectedRoute>
 */
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // If the role doesn't match, redirect to the correct dashboard
    return <Navigate to={role === "ADMIN" ? "/admin" : "/student"} replace />;
  }

  return children;
}

export default ProtectedRoute;
