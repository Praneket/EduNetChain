import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login             from "./pages/Login";
import Register          from "./pages/Register";
import Dashboard         from "./pages/Dashboard";
import AlumniLogin       from "./pages/AlumniLogin";
import AlumniRegister    from "./pages/AlumniRegister";
import AlumniDashboard   from "./pages/AlumniDashboard";
import AlumniProfile     from "./pages/AlumniProfile";
import Profile           from "./pages/Profile";
import Messages          from "./pages/Messages";
import VerifyCredential  from "./pages/VerifyCredential";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import UserProfile       from "./pages/UserProfile";
import ValidatorDashboard from "./pages/ValidatorDashboard";
import ValidatorLogin    from "./pages/ValidatorLogin";
import SuperAdminLogin   from "./pages/SuperAdminLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
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
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role,  setRole]  = useState(localStorage.getItem("role"));

  useEffect(() => {
    // Try to refresh token on load if expired
    const storedToken = localStorage.getItem("token");
    const storedRefresh = localStorage.getItem("refreshToken");
    if (!isTokenValid(storedToken) && storedRefresh) {
      import("./api").then(({ refreshToken }) => {
        refreshToken(storedRefresh)
          .then(res => {
            localStorage.setItem("token", res.data.token);
            setToken(res.data.token);
          })
          .catch(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("role");
            localStorage.removeItem("user");
            setToken(null);
            setRole(null);
          });
      });
    } else if (!isTokenValid(storedToken) && !storedRefresh) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      setToken(null);
      setRole(null);
    }

    const sync = () => {
      const t = localStorage.getItem("token");
      const r = localStorage.getItem("role");
      // Only update if values actually changed AND token is valid (prevents validator logout bug)
      if (t && isTokenValid(t)) {
        if (t !== token) setToken(t);
        if (r !== role)  setRole(r);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // Default redirect based on role
  const defaultRedirect = () => {
    if (localStorage.getItem('isSuperAdmin') === 'true' && localStorage.getItem('sa_token'))
      return <Navigate to="/super-admin" replace />;
    if (sessionStorage.getItem('isValidator') === 'true' && sessionStorage.getItem('val_token'))
      return <Navigate to="/validator" replace />;
    if (localStorage.getItem('alumni_token'))
      return <Navigate to="/alumni" replace />;
    if (!token) return <Navigate to="/login" replace />;
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
        <Route path="/alumni-login"    element={<AlumniLogin />} />
        <Route path="/alumni-register" element={<AlumniRegister />} />
        <Route path="/verify-credential" element={<VerifyCredential />} />
        <Route path="/validator-login" element={<ValidatorLogin />} />

        {/* ── Student ── */}
        <Route path="/dashboard" element={token && role === "student" ? <Dashboard />      : <Navigate to="/login"       replace />} />
        <Route path="/profile"   element={token && role === "student" ? <Profile />        : <Navigate to="/login"       replace />} />

        {/* ── Validator ── */}
        <Route path="/validator" element={
          sessionStorage.getItem('isValidator') === 'true' && sessionStorage.getItem('val_token')
            ? <ValidatorDashboard />
            : <Navigate to="/validator-login" replace />
        } />

        {/* ── Super Admin ── */}
        <Route path="/super-admin-login" element={<SuperAdminLogin />} />
        <Route path="/super-admin" element={
          localStorage.getItem('isSuperAdmin') === 'true' && localStorage.getItem('sa_token')
            ? <SuperAdminDashboard />
            : <Navigate to="/super-admin-login" replace />
        } />

        {/* ── Alumni ── */}
        <Route path="/alumni"         element={<AlumniDashboard />} />
        <Route path="/alumni-profile" element={<AlumniProfile />} />

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
