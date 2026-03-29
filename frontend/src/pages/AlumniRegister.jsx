import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AlumniRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    graduationYear: "",
    degree: "",
    currentCompany: "",
    currentPosition: "",
    linkedIn: "",
  });

  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("role", "alumni");

      const personalInfo = {
        phone: form.phone,
      };

      const educationInfo = {
        degree: form.degree,
        year: form.graduationYear,
      };

      const professionalInfo = {
        currentCompany: form.currentCompany,
        currentPosition: form.currentPosition,
        linkedIn: form.linkedIn,
      };

      formData.append("personalInfo", JSON.stringify(personalInfo));
      formData.append("educationInfo", JSON.stringify(educationInfo));
      formData.append("professionalInfo", JSON.stringify(professionalInfo));

      await axios.post(`${import.meta.env.VITE_API || "http://localhost:5000"}/api/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Alumni registration successful. You can now login!");
      nav("/alumni-login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-blue-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-2">
            Alumni Registration
          </h2>
          <p className="text-gray-600">
            Join our alumni network and help current students succeed
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                placeholder="Your contact number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* Education */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-green-700 mb-4">
              Education Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree *
                </label>
                <input
                  type="text"
                  placeholder="e.g., B.Tech Computer Science"
                  value={form.degree}
                  onChange={(e) => setForm({ ...form, degree: e.target.value })}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Graduation Year *
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2020"
                  value={form.graduationYear}
                  onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Professional */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-green-700 mb-4">
              Current Professional Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Company *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Google, Microsoft"
                  value={form.currentCompany}
                  onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Position *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Software Engineer"
                  value={form.currentPosition}
                  onChange={(e) => setForm({ ...form, currentPosition: e.target.value })}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Profile (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={form.linkedIn}
                  onChange={(e) => setForm({ ...form, linkedIn: e.target.value })}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold text-lg w-full md:w-auto"
            >
              {loading ? "Registering..." : "Register as Alumni"}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600">
            Already registered?{" "}
            <a href="/alumni-login" className="text-green-600 hover:text-green-700 font-semibold">
              Login here
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
