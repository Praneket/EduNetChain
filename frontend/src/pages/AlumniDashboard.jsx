import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { createPost, getMyPosts, deletePost, getApplicants, updateApplicantStatus, getStudentList } from "../api";
import { Trash2, Users, ChevronDown, ChevronUp, Briefcase, MapPin, Lightbulb, X, Search, CheckCircle, XCircle, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Avatar = ({ name, size = "md", color = "green" }) => {
  const sizes = { sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-base", lg: "w-14 h-14 text-xl" };
  const colors = { green: "from-emerald-500 to-emerald-700", blue: "from-[#0a66c2] to-[#004182]" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold">{name?.charAt(0)?.toUpperCase() || "?"}</span>
    </div>
  );
};

const typeConfig = {
  job:      { label: "Job",      bg: "bg-blue-50",   text: "text-[#0a66c2]",  border: "border-blue-200",  dot: "bg-[#0a66c2]" },
  referral: { label: "Referral", bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200", dot: "bg-green-600" },
  tip:      { label: "Tip",      bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-600" },
};

const emptyForm = { title: "", company: "", location: "", jobType: "", description: "", requirements: "", applyLink: "", tipCategory: "", content: "" };

const statusBadge = {
  pending:  "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
};

export default function AlumniDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts"); // "posts" | "students"
  const [showForm, setShowForm] = useState(false);
  const [postType, setPostType] = useState("job");
  const [myPosts, setMyPosts] = useState([]);
  const [applicants, setApplicants] = useState({});
  const [expandedPost, setExpandedPost] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);
  const [updatingApp, setUpdatingApp] = useState(null);

  useEffect(() => { fetchMyPosts(); }, []);
  useEffect(() => {
    if (activeTab === "students") fetchStudents();
  }, [activeTab]);

  const fetchMyPosts = async () => {
    try { const res = await getMyPosts(); setMyPosts(res.data); } catch {}
  };

  const fetchStudents = async (search = "") => {
    setStudentLoading(true);
    try {
      const res = await getStudentList(search ? { search } : {});
      setStudents(res.data);
    } catch {} finally { setStudentLoading(false); }
  };

  const handleStudentSearch = (e) => {
    e.preventDefault();
    fetchStudents(studentSearch);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPost({ ...form, type: postType });
      setShowForm(false);
      setForm(emptyForm);
      fetchMyPosts();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create post");
    }
  };

  const toggleApplicants = async (postId) => {
    if (expandedPost === postId) return setExpandedPost(null);
    if (!applicants[postId]) {
      try {
        const res = await getApplicants(postId);
        setApplicants(prev => ({ ...prev, [postId]: res.data }));
      } catch { return; }
    }
    setExpandedPost(postId);
  };

  const handleAppStatus = async (postId, appId, status) => {
    setUpdatingApp(appId);
    try {
      await updateApplicantStatus(postId, appId, status);
      const res = await getApplicants(postId);
      setApplicants(prev => ({ ...prev, [postId]: res.data }));
    } catch { alert("Failed to update status"); }
    finally { setUpdatingApp(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    try { await deletePost(id); fetchMyPosts(); } catch {}
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent bg-white transition";

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Header userRole="alumni" userName={user.name || "Alumni"} />

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-5">

        {/* LEFT */}
        <aside className="hidden lg:block space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-emerald-600 to-emerald-800" />
            <div className="px-4 pb-4 -mt-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center border-4 border-white shadow">
                <span className="text-white text-2xl font-bold">{(user.name || "A").charAt(0).toUpperCase()}</span>
              </div>
              <h2 className="font-bold text-gray-900 mt-2 text-base">{user.name || "Alumni"}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Alumni · EduNetChain</p>
              <button onClick={() => navigate("/alumni-profile")}
                className="mt-3 w-full border border-emerald-600 text-emerald-700 text-sm font-semibold py-1.5 rounded-full hover:bg-emerald-50 transition">
                View Profile
              </button>
            </div>
            <div className="border-t border-gray-100 px-4 py-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Posts created</span>
                <span className="text-emerald-600 font-semibold">{myPosts.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total applicants</span>
                <span className="text-emerald-600 font-semibold">
                  {myPosts.reduce((sum, p) => sum + (p.applications?.length || 0), 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 space-y-1">
            {[
              { id: "posts", label: "My Posts", icon: "📝" },
              { id: "students", label: "Student Directory", icon: "🎓" },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === t.id ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"}`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </aside>

        {/* CENTER */}
        <section className="space-y-4 min-w-0">

          {/* Tab switcher (mobile) */}
          <div className="flex gap-2 lg:hidden">
            {["posts", "students"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition ${activeTab === t ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                {t === "posts" ? "My Posts" : "Students"}
              </button>
            ))}
          </div>

          {/* ── POSTS TAB ── */}
          {activeTab === "posts" && (
            <>
              {/* Create Post Box */}
              {!showForm ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name || "A"} size="md" color="green" />
                    <button onClick={() => setShowForm(true)}
                      className="flex-1 text-left px-4 py-2.5 border border-gray-300 rounded-full text-sm text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition font-medium">
                      Share a job, referral, or tip…
                    </button>
                  </div>
                  <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100">
                    {[
                      { type: "job",      icon: <Briefcase className="w-4 h-4 text-[#0a66c2]" />, label: "Job" },
                      { type: "referral", icon: <Users className="w-4 h-4 text-green-600" />,     label: "Referral" },
                      { type: "tip",      icon: <Lightbulb className="w-4 h-4 text-amber-500" />, label: "Tip" },
                    ].map(item => (
                      <button key={item.type} onClick={() => { setPostType(item.type); setShowForm(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900 text-lg">Create a post</h2>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar name={user.name || "A"} size="md" color="green" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{user.name || "Alumni"}</p>
                        <div className="flex gap-1 mt-1">
                          {["job", "referral", "tip"].map(t => (
                            <button key={t} onClick={() => setPostType(t)}
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition ${
                                postType === t
                                  ? t === "job" ? "bg-[#0a66c2] text-white border-[#0a66c2]"
                                    : t === "referral" ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-purple-600 text-white border-purple-600"
                                  : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
                              }`}>
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-3">
                      {(postType === "job" || postType === "referral") && (
                        <>
                          <input type="text" placeholder="Job Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} required />
                          <input type="text" placeholder="Company Name *" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className={inputCls} required />
                          <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputCls} />
                            <select value={form.jobType} onChange={e => setForm({ ...form, jobType: e.target.value })} className={inputCls} required>
                              <option value="">Job Type *</option>
                              <option>Full-time</option><option>Internship</option><option>Contract</option>
                            </select>
                          </div>
                          <textarea placeholder="Job Description *" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputCls} h-28 resize-none`} required />
                          <textarea placeholder="Requirements (optional)" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} className={`${inputCls} h-20 resize-none`} />
                          <input type="url" placeholder="Application Link (optional)" value={form.applyLink} onChange={e => setForm({ ...form, applyLink: e.target.value })} className={inputCls} />
                        </>
                      )}
                      {postType === "tip" && (
                        <>
                          <input type="text" placeholder="Category *" value={form.tipCategory} onChange={e => setForm({ ...form, tipCategory: e.target.value })} className={inputCls} required />
                          <textarea placeholder="Share your tip… *" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className={`${inputCls} h-36 resize-none`} required />
                        </>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-sm font-semibold text-gray-600 rounded-full hover:bg-gray-100 transition">Cancel</button>
                        <button type="submit" className="px-6 py-2 text-sm font-semibold bg-[#0a66c2] text-white rounded-full hover:bg-[#004182] transition">Post</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Posts list */}
              {myPosts.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
                  <div className="text-5xl mb-3">📝</div>
                  <p className="text-gray-700 font-semibold">No posts yet</p>
                  <p className="text-gray-400 text-sm mt-1">Share a job, referral, or interview tip</p>
                </div>
              ) : myPosts.map(post => {
                const cfg = typeConfig[post.type] || typeConfig.job;
                return (
                  <div key={post._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar name={user.name || "A"} size="md" color="green" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                              <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                              </span>
                              <button onClick={() => handleDelete(post._id)} className="text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <h3 className="font-bold text-gray-900 mt-2">{post.title || post.tipCategory}</h3>
                          {post.company && <p className="text-sm text-[#0a66c2] font-medium">{post.company}</p>}
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                            {post.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{post.location}</span>}
                            {post.jobType && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{post.jobType}</span>}
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.description || post.content}</p>
                        </div>
                      </div>
                    </div>

                    {/* Applicants toggle */}
                    <div className="border-t border-gray-100 px-4 py-2.5">
                      <button onClick={() => toggleApplicants(post._id)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0a66c2] font-medium transition">
                        <Users className="w-4 h-4" />
                        <span>{post.applications?.length || 0} applicant{post.applications?.length !== 1 ? "s" : ""}</span>
                        {expandedPost === post._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {expandedPost === post._id && (
                      <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                        {!applicants[post._id] ? (
                          <p className="text-sm text-gray-400">Loading…</p>
                        ) : applicants[post._id].length === 0 ? (
                          <p className="text-sm text-gray-400">No applicants yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {applicants[post._id].map(app => (
                              <div key={app._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="cursor-pointer" onClick={() => navigate(`/profile/${app.studentId?._id || app.studentId}`)}>                                
                                  <Avatar name={app.studentName} size="sm" color="blue" />
                                </div>
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${app.studentId?._id || app.studentId}`)}>
                                  <p className="text-sm font-semibold text-gray-900 truncate">{app.studentName}</p>
                                  <p className="text-xs text-gray-500 truncate">{app.studentEmail}</p>
                                  {app.studentId?.educationInfo?.degree && (
                                    <p className="text-xs text-gray-400 truncate">
                                      {app.studentId.educationInfo.degree} · {app.studentId.educationInfo.institution || app.studentId.educationInfo.institute}
                                    </p>
                                  )}
                                  <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadge[app.status || "pending"]}`}>
                                    {app.status || "pending"}
                                  </span>
                                </div>
                                {(!app.status || app.status === "pending") && (
                                  <div className="flex gap-1 flex-shrink-0">
                                    <button
                                      disabled={updatingApp === app._id}
                                      onClick={() => handleAppStatus(post._id, app._id, "accepted")}
                                      className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-full hover:bg-green-100 transition disabled:opacity-50">
                                      <CheckCircle className="w-3.5 h-3.5" /> Accept
                                    </button>
                                    <button
                                      disabled={updatingApp === app._id}
                                      onClick={() => handleAppStatus(post._id, app._id, "rejected")}
                                      className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-full hover:bg-red-100 transition disabled:opacity-50">
                                      <XCircle className="w-3.5 h-3.5" /> Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── STUDENTS TAB ── */}
          {activeTab === "students" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-600" /> Student Directory
                </h2>
                <form onSubmit={handleStudentSearch} className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      placeholder="Search by name, email or skill…"
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition">
                    Search
                  </button>
                </form>
              </div>

              {studentLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                      <div className="flex gap-3"><div className="w-10 h-10 rounded-full bg-gray-200" /><div className="flex-1 space-y-2"><div className="h-3 bg-gray-200 rounded w-1/3" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div>
                    </div>
                  ))}
                </div>
              ) : students.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
                  <div className="text-5xl mb-3">🎓</div>
                  <p className="text-gray-700 font-semibold">No students found</p>
                  <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map(s => (
                    <div key={s._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/profile/${s._id}`)}>
                      <Avatar name={s.name} size="md" color="blue" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">{s.name}</p>
                            <p className="text-xs text-gray-500">{s.email}</p>
                          </div>
                        </div>
                        {s.educationInfo?.degree && (
                          <p className="text-sm text-gray-600 mt-1">
                            {s.educationInfo.degree}{s.educationInfo.branch ? ` — ${s.educationInfo.branch}` : ""} · {s.educationInfo.institution || s.educationInfo.institute}
                          </p>
                        )}
                        {s.educationInfo?.year && (
                          <p className="text-xs text-gray-400">Class of {s.educationInfo.year}</p>
                        )}
                        {s.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {s.skills.slice(0, 6).map(sk => (
                              <span key={sk} className="text-xs px-2 py-0.5 bg-blue-50 text-[#0a66c2] rounded-full border border-blue-100">{sk}</span>
                            ))}
                            {s.skills.length > 6 && <span className="text-xs text-gray-400">+{s.skills.length - 6} more</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* RIGHT */}
        <aside className="hidden lg:block space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Activity</p>
            <div className="space-y-3">
              {[
                { label: "Total Posts",     val: myPosts.length,                                    color: "text-emerald-600" },
                { label: "Jobs Posted",     val: myPosts.filter(p => p.type === "job").length,      color: "text-[#0a66c2]" },
                { label: "Referrals",       val: myPosts.filter(p => p.type === "referral").length, color: "text-emerald-600" },
                { label: "Tips Shared",     val: myPosts.filter(p => p.type === "tip").length,      color: "text-purple-600" },
                { label: "Total Applicants",val: myPosts.reduce((s, p) => s + (p.applications?.length || 0), 0), color: "text-amber-600" },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 px-1">© 2025 EduNetChain · SVPM COE</p>
        </aside>
      </main>
    </div>
  );
}
