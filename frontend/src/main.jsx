import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login             from "./pages/Login";
import Register          from "./pages/Register";
import Dashboard         from "./pages/Dashboard";
import AdminLogin        from "./pages/AdminLogin";
import AdminDashboard    from "./pages/AdminDashboard";
import AlumniLogin       from "./pages/AlumniLogin";
import AlumniRegister    from "./pages/AlumniRegister";
import AlumniDashboard   from "./pages/AlumniDashboard";
import AlumniProfile     from "./pages/AlumniProfile";
import Profile           from "./pages/Profile";
import Messages          from "./pages/Messages";
import VerifyCredential  from "./pages/VerifyCredential";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import UserProfile       from "./pages/UserProfile";
import "./style.css";

function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function App() {
  const storedToken = localStorage.getItem("token");
  if (!isTokenValid(storedToken)) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
  }

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role,  setRole]  = useState(localStorage.getItem("role"));

  useEffect(() => {
    const sync = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // Default redirect based on role
  const defaultRedirect = () => {
    if (!token) return <Navigate to="/login" replace />;
    if (role === "admin")     return <Navigate to="/admin"     replace />;
    if (role === "alumni")    return <Navigate to="/alumni"    replace />;
    if (role === "recruiter") return <Navigate to="/recruiter" replace />;
    return <Navigate to="/dashboard" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route path="/" element={defaultRedirect()} />

        {/* ── Public ── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/admin-login"     element={<AdminLogin />} />
        <Route path="/alumni-login"    element={<AlumniLogin />} />
        <Route path="/alumni-register" element={<AlumniRegister />} />
        <Route path="/verify-credential" element={<VerifyCredential />} />

        {/* ── Student ── */}
        <Route path="/dashboard" element={token && role === "student" ? <Dashboard />      : <Navigate to="/login"       replace />} />
        <Route path="/profile"   element={token && role === "student" ? <Profile />        : <Navigate to="/login"       replace />} />

        {/* ── Admin ── */}
        <Route path="/admin"     element={token && role === "admin"   ? <AdminDashboard /> : <Navigate to="/admin-login" replace />} />

        {/* ── Alumni ── */}
        <Route path="/alumni"         element={token && role === "alumni" ? <AlumniDashboard /> : <Navigate to="/alumni-login" replace />} />
        <Route path="/alumni-profile" element={token && role === "alumni" ? <AlumniProfile />   : <Navigate to="/alumni-login" replace />} />

        {/* ── Recruiter ── */}
        <Route path="/recruiter" element={token && role === "recruiter" ? <RecruiterDashboard /> : <Navigate to="/login" replace />} />

        {/* ── Shared ── */}
        <Route path="/messages" element={token ? <Messages /> : <Navigate to="/login" replace />} />
        <Route path="/profile/:id" element={token ? <UserProfile /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
