import React, { useState } from "react";
import { adminLogin } from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminLogin(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("role", "admin");
      localStorage.setItem("user", JSON.stringify(res.data.user)); // ✅ Store user data
      window.dispatchEvent(new Event("storage"));
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md p-8 rounded-xl w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-800">
          Admin Login
        </h2>
        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <form onSubmit={submit}>
          <input
            type="email"
            placeholder="Admin Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full mb-3 p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full mb-3 p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Not an admin?{" "}
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Back to Student Login
          </a>
        </p>
      </div>
    </div>
  );
}
