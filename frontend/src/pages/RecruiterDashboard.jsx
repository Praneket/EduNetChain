import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchStudents, verifyByWallet } from "../api";
import { Search, Shield, GraduationCap, LogOut, ChevronRight, X, CheckCircle, XCircle, Filter } from "lucide-react";

const Avatar = ({ name, size = "md" }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-xl" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold">{name?.charAt(0)?.toUpperCase() || "?"}</span>
    </div>
  );
};

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [students, setStudents]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState(null);
  const [walletInput, setWalletInput] = useState("");
  const [walletResult, setWalletResult] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [activeTab, setActiveTab]   = useState("search"); // "search" | "verify"

  const [filters, setFilters] = useState({ name: "", skill: "", degree: "", year: "", page: 1 });

  useEffect(() => { fetchStudents(); }, [filters.page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.name)  params.name  = filters.name;
      if (filters.skill) params.skill = filters.skill;
      if (filters.degree)params.degree= filters.degree;
      if (filters.year)  params.year  = filters.year;
      params.page  = filters.page;
      params.limit = 12;
      const res = await searchStudents(params);
      setStudents(res.data.students);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(f => ({ ...f, page: 1 }));
    fetchStudents();
  };

  const handleWalletVerify = async (e) => {
    e.preventDefault();
    if (!walletInput.trim()) return;
    setWalletLoading(true);
    setWalletResult(null);
    try {
      const res = await verifyByWallet(walletInput.trim());
      setWalletResult(res.data);
    } catch (err) {
      setWalletResult({ verified: false, error: err.response?.data?.msg || "Not found" });
    } finally { setWalletLoading(false); }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white";

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">EduNetChain</span>
            <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full">Recruiter</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:inline">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Search blockchain-verified students and validate credentials instantly</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 w-fit mb-6 shadow-sm">
          {[
            { id: "search", label: "Search Students", icon: <Search className="w-4 h-4" /> },
            { id: "verify", label: "Verify Credential", icon: <Shield className="w-4 h-4" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === tab.id ? "bg-violet-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Search Tab ── */}
        {activeTab === "search" && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
              <form onSubmit={handleSearch} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <input value={filters.name}   onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}   placeholder="Name" className={inp} />
                <input value={filters.skill}  onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))}  placeholder="Skill (e.g. React)" className={inp} />
                <input value={filters.degree} onChange={e => setFilters(f => ({ ...f, degree: e.target.value }))} placeholder="Degree" className={inp} />
                <input value={filters.year}   onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}   placeholder="Year" className={inp} />
                <button type="submit" className="flex items-center justify-center gap-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition px-4 py-2">
                  <Filter className="w-4 h-4" /> Search
                </button>
              </form>
            </div>

            {/* Results */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{total} verified student{total !== 1 ? "s" : ""} found</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                    <div className="flex gap-3"><div className="w-10 h-10 rounded-full bg-gray-200"/><div className="flex-1 space-y-2"><div className="h-3 bg-gray-200 rounded w-1/2"/><div className="h-3 bg-gray-200 rounded w-1/3"/></div></div>
                  </div>
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center shadow-sm">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-gray-700">No students found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map(s => (
                  <div key={s._id} onClick={() => setSelected(s)}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer p-4 group">
                    <div className="flex items-start gap-3">
                      <Avatar name={s.name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 truncate">{s.name}</p>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-600 transition flex-shrink-0" />
                        </div>
                        <p className="text-xs text-gray-500 truncate">{s.email}</p>
                        <p className="text-xs text-gray-600 mt-1">{s.educationInfo?.degree || "—"} · {s.educationInfo?.year || "—"}</p>
                      </div>
                    </div>
                    {/* Skills */}
                    {s.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {s.skills.slice(0, 4).map(skill => (
                          <span key={skill} className="text-xs px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full border border-violet-100">{skill}</span>
                        ))}
                        {s.skills.length > 4 && <span className="text-xs text-gray-400">+{s.skills.length - 4}</span>}
                      </div>
                    )}
                    {/* Blockchain badge */}
                    <div className="mt-3 flex items-center gap-1.5">
                      {s.verificationHashes?.length > 0 ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          <Shield className="w-3 h-3" /> Blockchain Verified
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not yet verified on chain</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > 12 && (
              <div className="flex justify-center gap-2 mt-6">
                <button disabled={filters.page === 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                  className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition">
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">Page {filters.page} of {Math.ceil(total / 12)}</span>
                <button disabled={filters.page >= Math.ceil(total / 12)} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                  className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition">
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Verify Tab ── */}
        {activeTab === "verify" && (
          <div className="max-w-xl">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
                <Shield className="w-5 h-5 text-violet-600" /> Blockchain Credential Verification
              </h2>
              <p className="text-sm text-gray-500 mb-5">Enter a student's wallet address to instantly verify their blockchain credentials.</p>
              <form onSubmit={handleWalletVerify} className="flex gap-2">
                <input
                  value={walletInput}
                  onChange={e => setWalletInput(e.target.value)}
                  placeholder="0x... wallet address"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button type="submit" disabled={walletLoading}
                  className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition disabled:opacity-60">
                  {walletLoading ? "Checking…" : "Verify"}
                </button>
              </form>

              {walletResult && (
                <div className={`mt-5 p-4 rounded-xl border ${walletResult.verified ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {walletResult.verified
                      ? <><CheckCircle className="w-5 h-5 text-green-600" /><span className="font-bold text-green-800">Credentials Verified ✓</span></>
                      : <><XCircle className="w-5 h-5 text-red-500" /><span className="font-bold text-red-700">{walletResult.error || "Not Verified"}</span></>
                    }
                  </div>
                  {walletResult.student && (
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Name:</span> <span className="font-semibold text-gray-900">{walletResult.student.name}</span></p>
                      <p><span className="text-gray-500">Email:</span> <span className="text-gray-700">{walletResult.student.email}</span></p>
                      <p><span className="text-gray-500">Degree:</span> <span className="text-gray-700">{walletResult.student.educationInfo?.degree || "—"}</span></p>
                      <p><span className="text-gray-500">Hashes on chain:</span> <span className="font-semibold text-green-700">{walletResult.student.verificationHashes?.length || 0}</span></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Student Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Student Profile</h3>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center gap-4">
                <Avatar name={selected.name} size="lg" />
                <div>
                  <h4 className="font-bold text-gray-900 text-xl">{selected.name}</h4>
                  <p className="text-gray-500 text-sm">{selected.email}</p>
                  {selected.verificationHashes?.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 mt-1">
                      <Shield className="w-3 h-3" /> Blockchain Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> Education</p>
                <p className="text-sm font-semibold text-gray-900">{selected.educationInfo?.institution || selected.educationInfo?.institute || "—"}</p>
                <p className="text-sm text-gray-600">{selected.educationInfo?.degree || "—"}</p>
                <p className="text-xs text-gray-400">{selected.educationInfo?.year ? `Class of ${selected.educationInfo.year}` : ""}</p>
              </div>

              {/* Skills */}
              {selected.skills?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.skills.map(s => (
                      <span key={s} className="text-xs px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full border border-violet-100 font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Wallet */}
              {selected.walletAddress && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Blockchain Wallet</p>
                  <p className="text-xs font-mono text-gray-700 break-all">{selected.walletAddress}</p>
                  <p className="text-xs text-green-600 mt-1">{selected.verificationHashes?.length || 0} credential hash{selected.verificationHashes?.length !== 1 ? "es" : ""} on chain</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
