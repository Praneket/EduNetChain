import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, Clock, ShieldCheck, BarChart2, UserPlus,
  Trash2, Eye, CheckCircle, XCircle, RefreshCw, Users
} from "lucide-react";
import {
  getPendingStudents,
  getAdminValidators, deleteAdminUser, createValidator,
  getAdminStats,
} from "../api";

const TABS = [
  { id: "pending",    label: "Pending Students", icon: Clock },
  { id: "validators", label: "Validators",        icon: ShieldCheck },
  { id: "overview",   label: "Overview",          icon: BarChart2 },
];

export default function AdminDashboard() {
  const [tab, setTab]               = useState("pending");
  const [pending, setPending]       = useState([]);
  const [validators, setValidators] = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [msg, setMsg]               = useState({ text: "", type: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newV, setNewV]             = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const adminName = JSON.parse(localStorage.getItem("user") || "{}").name || "Admin";

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "pending") {
        const res = await getPendingStudents();
        setPending(res.data);
      } else if (tab === "validators") {
        const res = await getAdminValidators();
        setValidators(res.data);
      } else if (tab === "overview") {
        const res = await getAdminStats();
        setStats(res.data);
      }
    } catch (err) {
      flash(err.response?.data?.msg || "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteValidator = async (id, name) => {
    if (!confirm(`Remove validator "${name}"?`)) return;
    try {
      await deleteAdminUser(id);
      setValidators(v => v.filter(x => x._id !== id));
      flash(`Validator "${name}" removed`);
    } catch (err) {
      flash(err.response?.data?.msg || "Error removing validator", "error");
    }
  };

  const handleAddValidator = async (e) => {
    e.preventDefault();
    try {
      await createValidator(newV);
      flash("✅ Validator created successfully");
      setNewV({ name: "", email: "", password: "" });
      setShowAddForm(false);
      load();
    } catch (err) {
      flash(err.response?.data?.msg || "Error creating validator", "error");
    }
  };

  const handleLogout = () => {
    ['token', 'role', 'userId', 'user', 'isValidator', 'refreshToken'].forEach(k => localStorage.removeItem(k));
    window.location.href = '/admin-login';
  };

  const fileUrl = (path) => {
    const base  = import.meta.env.VITE_API || "http://localhost:5000";
    const token = localStorage.getItem("token");
    return path?.startsWith("http")
      ? `${base}/api/users/file?token=${token}&url=${encodeURIComponent(path)}`
      : `${base}/${path?.replace(/\\/g, "/")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">EduNetChain Admin</h1>
            <p className="text-slate-400 text-xs mt-0.5">Control Panel</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm bg-slate-700 px-3 py-1.5 rounded-full text-slate-200">
              👤 {adminName}
            </span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-sm transition">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                tab === id
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              <Icon size={15} /> {label}
              {id === "pending" && pending.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
          <button onClick={load} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 px-3 transition">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {msg.text && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium text-center ${
            msg.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
          }`}>
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* ── PENDING STUDENTS ── */}
            {tab === "pending" && (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  These students are awaiting validator consensus approval. Admin view only — voting happens in the Validator Portal.
                </p>
                {pending.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                    <p>No pending students</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pending.map(s => (
                      <div key={s._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{s.name}</h3>
                            <p className="text-xs text-gray-500">{s.email}</p>
                          </div>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">Pending</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Institute:</span> {s.educationInfo?.institution || s.educationInfo?.institute || "N/A"}</p>
                          <p><span className="font-medium">Degree:</span> {s.educationInfo?.degree || "N/A"}</p>
                          <p><span className="font-medium">Year:</span> {s.educationInfo?.year || "N/A"}</p>
                          <p><span className="font-medium">Phone:</span> {s.personalInfo?.phone || "N/A"}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {s.resumePath && (
                            <a href={fileUrl(s.resumePath)} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                              <Eye size={12} /> Resume
                            </a>
                          )}
                          {s.certificates?.map((f, i) => (
                            <a key={i} href={fileUrl(f)} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                              <Eye size={12} /> Cert {i + 1}
                            </a>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                          Registered: {new Date(s.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── VALIDATORS ── */}
            {tab === "validators" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="font-semibold text-gray-800">Validator Management</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Validators vote on student requests. Consensus = floor(N/2) + 1 approvals required.
                    </p>
                  </div>
                  <button onClick={() => setShowAddForm(v => !v)}
                    className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm transition">
                    <UserPlus size={15} /> Add Validator
                  </button>
                </div>

                {/* Consensus info */}
                {validators.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 text-sm text-blue-700">
                    <strong>{validators.length}</strong> active validators · Majority required: <strong>{Math.floor(validators.length / 2) + 1}</strong> votes
                  </div>
                )}

                {/* Add Validator Form */}
                {showAddForm && (
                  <form onSubmit={handleAddValidator}
                    className="bg-white border border-gray-200 rounded-xl p-5 mb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name</label>
                      <input required placeholder="Dr. John Smith" value={newV.name}
                        onChange={e => setNewV(v => ({ ...v, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
                      <input required type="email" placeholder="faculty@college.edu" value={newV.email}
                        onChange={e => setNewV(v => ({ ...v, email: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
                      <input required type="password" placeholder="••••••••" value={newV.password}
                        onChange={e => setNewV(v => ({ ...v, password: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="md:col-span-3 flex gap-2">
                      <button type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm transition">
                        Create Validator
                      </button>
                      <button type="button" onClick={() => setShowAddForm(false)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {validators.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No validators yet. Add one above.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="px-5 py-3 text-left">Name</th>
                          <th className="px-5 py-3 text-left">Email</th>
                          <th className="px-5 py-3 text-left">Role</th>
                          <th className="px-5 py-3 text-left">Added</th>
                          <th className="px-5 py-3 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {validators.map(v => (
                          <tr key={v._id} className="hover:bg-gray-50">
                            <td className="px-5 py-3 font-medium text-gray-800">{v.name}</td>
                            <td className="px-5 py-3 text-gray-500">{v.email}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                v.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                              }`}>
                                {v.role}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-gray-400">{new Date(v.createdAt).toLocaleDateString()}</td>
                            <td className="px-5 py-3">
                              {v.role !== "admin" && (
                                <button onClick={() => handleDeleteValidator(v._id, v.name)}
                                  className="text-red-400 hover:text-red-600 transition p-1 rounded hover:bg-red-50">
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── OVERVIEW ── */}
            {tab === "overview" && stats && (
              <div>
                <h2 className="font-semibold text-gray-800 mb-5">System Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Users",       value: stats.totalUsers,       color: "blue",   icon: "👥" },
                    { label: "Students",           value: stats.totalStudents,    color: "indigo", icon: "🎓" },
                    { label: "Verified Students",  value: stats.verifiedStudents, color: "green",  icon: "✅" },
                    { label: "Pending Approval",   value: stats.pendingStudents,  color: "yellow", icon: "⏳" },
                    { label: "Alumni",             value: stats.totalAlumni,      color: "teal",   icon: "🏛️" },
                    { label: "Recruiters",         value: stats.totalRecruiters,  color: "orange", icon: "💼" },
                    { label: "Validators",         value: stats.totalValidators,  color: "purple", icon: "🛡️" },
                    { label: "Blockchain Records", value: stats.blockchainRecords,color: "gray",   icon: "⛓️" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                      <div className="text-2xl mb-1">{icon}</div>
                      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
                      <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-700 mb-3">How Consensus Works</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                      <p>Student registers → a pending <strong>ADD request</strong> is created automatically</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                      <p>Validators log in to the <strong>Validator Portal</strong> and cast approve/reject votes</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                      <p>When approvals ≥ <strong>floor(N/2) + 1</strong>, the request is auto-approved</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                      <p>Student data is <strong>hashed (Keccak-256)</strong> and stored on blockchain via smart contract</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                      <p>Any future data change requires a new <strong>UPDATE request</strong> with full validator consensus</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
