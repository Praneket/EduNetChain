import React, { useEffect, useState } from "react";
import { getPendingStudents, approveStudent, rejectStudent } from "../api";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || '{}');
  const adminName = user?.name || "Admin";

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await getPendingStudents();
        setStudents(res.data);
      } catch (err) {
        console.error("Error fetching pending students:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const handleVerify = async (id) => {
    try {
      await approveStudent(id);
      setMsg("✅ Student verified successfully");
      setStudents(students.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
      setMsg("❌ Error verifying student");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await rejectStudent(id, reason);
      setMsg("🚫 Student rejected successfully");
      setStudents(students.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    navigate("/admin-login");
  };

  if (loading) return <p className="text-center mt-10">Loading pending students...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {adminName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {msg && <p className="text-green-600 text-center mb-4 font-semibold">{msg}</p>}

        {students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">🎉 No pending students</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((s) => (
              <div key={s._id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
                <h2 className="font-semibold text-lg text-blue-700 mb-2">{s.name}</h2>
                <p className="text-sm text-gray-600"><strong>Email:</strong> {s.email}</p>
                <p className="text-sm text-gray-600"><strong>Institute:</strong> {s.educationInfo?.institution || s.educationInfo?.institute || "N/A"}</p>
                <p className="text-sm text-gray-600"><strong>Degree:</strong> {s.educationInfo?.degree || "N/A"}</p>
                <p className="text-sm text-gray-600"><strong>Year:</strong> {s.educationInfo?.year || "N/A"}</p>
                <p className="text-sm text-gray-600"><strong>Phone:</strong> {s.personalInfo?.phone || "N/A"}</p>

                {/* 🔹 Resume */}
                {s.resumePath && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Resume:</h4>
                    <a
                      href={s.resumePath.startsWith('http') ? s.resumePath : `${import.meta.env.VITE_API || "http://localhost:5000"}/${s.resumePath.replace(/\\/g, "/")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 text-sm"
                    >
                      View Resume
                    </a>
                  </div>
                )}

                {/* 🔹 Certificates */}
                {s.certificates && s.certificates.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Certificates:</h4>
                    <ul className="list-disc ml-5 text-sm">
                      {s.certificates.map((file, i) => (
                        <li key={i}>
                          <a
                            href={file.startsWith('http') ? file : `${import.meta.env.VITE_API || "http://localhost:5000"}/${file.replace(/\\/g, "/")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            View Certificate {i + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleVerify(s._id)}
                    className="bg-green-600 text-white flex-1 py-2 rounded hover:bg-green-700 transition font-semibold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(s._id)}
                    className="bg-red-600 text-white flex-1 py-2 rounded hover:bg-red-700 transition font-semibold"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
