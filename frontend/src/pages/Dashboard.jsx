import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { MapPin, Briefcase, Heart, ExternalLink, MessageSquare, ThumbsUp, Send, BookOpen, ChevronDown, Zap, TrendingUp, Search, X, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPosts, applyToPost, likePost, getComments, addComment, getSkillGap, getRecommendations, getAlumniList, getMyApplications } from "../api";

const Avatar = ({ name, size = "md", color = "blue" }) => {
  const sizes = { sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-base", lg: "w-12 h-12 text-lg" };
  const colors = { blue: "from-[#0a66c2] to-[#004182]", green: "from-emerald-500 to-emerald-700" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold">{name?.charAt(0)?.toUpperCase() || "?"}</span>
    </div>
  );
};

const typeConfig = {
  job:      { label: "Job",      bg: "bg-blue-50",   text: "text-[#0a66c2]",  border: "border-blue-200",  dot: "bg-[#0a66c2]" },
  referral: { label: "Referral", bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200", dot: "bg-green-600" },
  tip:      { label: "Tip",      bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200",dot: "bg-purple-600" },
};

function PostCard({ post, onApply, onLike }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadedComments, setLoadedComments] = useState(false);
  const cfg = typeConfig[post.type] || typeConfig.job;

  const toggleComments = async () => {
    setShowComments(v => !v);
    if (!loadedComments) {
      const res = await getComments(post._id);
      setComments(res.data);
      setLoadedComments(true);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await addComment(post._id, commentText);
    setCommentText("");
    const res = await getComments(post._id);
    setComments(res.data);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <Avatar name={post.authorName} size="md" color={post.type === "referral" ? "green" : "blue"} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 text-sm leading-tight">{post.authorName}</p>
                {post.authorCompany && (
                  <p className="text-xs text-gray-500">{post.authorCompany}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </div>
              <span className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3">
          {(post.type === "job" || post.type === "referral") && (
            <>
              <h3 className="font-bold text-gray-900 text-base leading-snug">{post.title}</h3>
              {post.company && <p className="text-sm font-medium text-[#0a66c2] mt-0.5">{post.company}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                {post.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{post.location}</span>}
                {post.jobType && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{post.jobType}</span>}
              </div>
              {post.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">{post.description}</p>
              )}
            </>
          )}
          {post.type === "tip" && (
            <>
              {post.tipCategory && (
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">{post.tipCategory}</p>
              )}
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {(post.likes?.length > 0 || post.applications?.length > 0) && (
        <div className="px-4 py-1.5 flex items-center gap-3 text-xs text-gray-400 border-t border-gray-100">
          {post.likes?.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-[#0a66c2] flex items-center justify-center">
                <ThumbsUp className="w-2.5 h-2.5 text-white" />
              </span>
              {post.likes.length}
            </span>
          )}
          {post.applications?.length > 0 && (
            <span className="ml-auto">{post.applications.length} applicant{post.applications.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-2 py-1 border-t border-gray-100 flex items-center gap-1">
        <button
          onClick={() => onLike(post._id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-500 font-medium rounded-md hover:bg-gray-100 hover:text-[#0a66c2] transition-colors"
        >
          <ThumbsUp className="w-4 h-4" /> Like
        </button>
        <button
          onClick={toggleComments}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-500 font-medium rounded-md hover:bg-gray-100 hover:text-[#0a66c2] transition-colors"
        >
          <MessageSquare className="w-4 h-4" /> Comment
        </button>
        {(post.type === "job" || post.type === "referral") && (
          <button
            onClick={() => onApply(post._id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-[#0a66c2] font-semibold rounded-md hover:bg-blue-50 transition-colors"
          >
            <Send className="w-4 h-4" /> Apply
          </button>
        )}
        {post.applyLink && (
          <a
            href={post.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-500 font-medium rounded-md hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Link
          </a>
        )}
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          {comments.map(c => (
            <div key={c._id} className="flex gap-2">
              <Avatar name={c.authorName} size="sm" color={c.authorRole === "alumni" ? "green" : "blue"} />
              <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                <p className="text-xs font-semibold text-gray-800">{c.authorName}
                  <span className="text-gray-400 font-normal ml-1 capitalize">· {c.authorRole}</span>
                </p>
                <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <Avatar name={JSON.parse(localStorage.getItem("user") || "{}").name || "?"} size="sm" />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleComment()}
                placeholder="Add a comment…"
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:bg-white transition"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="text-[#0a66c2] disabled:opacity-30 hover:bg-blue-50 p-2 rounded-full transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.name || "Student";
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("job");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillGap, setSkillGap] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [alumniSearch, setAlumniSearch] = useState("");
  const [alumniResults, setAlumniResults] = useState([]);
  const [alumniSearched, setAlumniSearched] = useState(false);
  const [quickPanel, setQuickPanel] = useState(null); // "applications" | "saved"
  const [myApplications, setMyApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => { fetchPosts(activeTab); }, [activeTab]);
  useEffect(() => { fetchAI(); }, []);
  useEffect(() => { loadAllAlumni(); }, []);

  const fetchAI = async () => {
    try {
      const [gapRes, recRes] = await Promise.all([getSkillGap(), getRecommendations()]);
      setSkillGap(gapRes.data);
      setRecommendations(recRes.data.recommendations || []);
    } catch {}
  };

  const fetchPosts = async (type) => {
    try {
      setLoading(true);
      const res = await getPosts(type);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (postId) => {
    try {
      await applyToPost(postId);
      alert("Application submitted!");
      fetchPosts(activeTab);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to apply");
    }
  };

  const handleLike = async (postId) => {
    try { await likePost(postId); fetchPosts(activeTab); } catch {}
  };

  const loadAllAlumni = async () => {
    try {
      const res = await getAlumniList();
      setAlumniResults(res.data);
      setAlumniSearched(true);
    } catch {}
  };

  const searchAlumni = async (e) => {
    e.preventDefault();
    try {
      const res = await getAlumniList(alumniSearch.trim() || undefined);
      setAlumniResults(res.data);
      setAlumniSearched(true);
    } catch {}
  };

  const openApplications = async () => {
    setQuickPanel("applications");
    setAppsLoading(true);
    try {
      const res = await getMyApplications();
      setMyApplications(res.data);
    } catch {} finally { setAppsLoading(false); }
  };

  const tabs = [
    { id: "job",      label: "Jobs & Internships", icon: "💼" },
    { id: "referral", label: "Referrals",           icon: "🤝" },
    { id: "tip",      label: "Interview Tips",      icon: "💡" },
  ];

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Header userRole="student" userName={userName} />

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-5">

        {/* LEFT — Profile Card */}
        <aside className="hidden lg:block space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Cover */}
            <div className="h-16 bg-gradient-to-r from-[#0a66c2] to-[#004182]" />
            <div className="px-4 pb-4 -mt-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center border-4 border-white shadow">
                <span className="text-white text-2xl font-bold">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <h2 className="font-bold text-gray-900 mt-2 text-base">{userName}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Student · EduNetChain</p>
              <button
                onClick={() => navigate("/profile")}
                className="mt-3 w-full border border-[#0a66c2] text-[#0a66c2] text-sm font-semibold py-1.5 rounded-full hover:bg-blue-50 transition"
              >
                View Profile
              </button>
            </div>
            <div className="border-t border-gray-100 px-4 py-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Profile views</span>
                <span className="text-[#0a66c2] font-semibold">—</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Post impressions</span>
                <span className="text-[#0a66c2] font-semibold">—</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Access</p>
            <div className="space-y-2">
              <button
                onClick={openApplications}
                className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-[#0a66c2] hover:bg-blue-50 px-2 py-1.5 rounded-md transition text-left"
              >
                <span className="text-gray-400"><Send className="w-4 h-4" /></span>
                My Applications
              </button>
              <button
                onClick={() => navigate("/messages")}
                className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-[#0a66c2] hover:bg-blue-50 px-2 py-1.5 rounded-md transition text-left"
              >
                <span className="text-gray-400"><MessageSquare className="w-4 h-4" /></span>
                Messages
              </button>
            </div>
          </div>

          {/* Applications Panel */}
          {quickPanel === "applications" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-900">My Applications</p>
                <button onClick={() => setQuickPanel(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
              {appsLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
              ) : myApplications.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No applications yet.<br/>Apply to jobs from the feed.</p>
              ) : (
                <div className="space-y-2">
                  {myApplications.map(app => {
                    const statusStyle = {
                      accepted: "bg-green-50 text-green-700 border-green-200",
                      rejected: "bg-red-50 text-red-600 border-red-200",
                      pending:  "bg-amber-50 text-amber-700 border-amber-200",
                    }[app.status] || "bg-gray-50 text-gray-500 border-gray-200";
                    return (
                      <div key={app._id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs font-semibold text-gray-900 truncate">{app.title || app.type}</p>
                        <p className="text-xs text-[#0a66c2] truncate">{app.company || app.authorCompany}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${statusStyle}`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* CENTER — Feed */}
        <section className="space-y-4 min-w-0">
          {/* Filter Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1 flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#0a66c2] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-700 font-semibold">No {activeTab}s posted yet</p>
              <p className="text-gray-400 text-sm mt-1">Check back later for updates from alumni</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard key={post._id} post={post} onApply={handleApply} onLike={handleLike} />
              ))}
            </div>
          )}
        </section>

        {/* RIGHT — AI Panel */}
        <aside className="hidden lg:block space-y-3">
          {/* Skill Gap */}
          {skillGap && skillGap.gaps?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Skill Gaps to Fill
              </p>
              <div className="space-y-2">
                {skillGap.gaps.slice(0, 5).map(g => (
                  <div key={g.skill} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{g.skill}</span>
                    <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">{g.demandCount} jobs</span>
                  </div>
                ))}
              </div>
              {skillGap.strengths?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-green-600 mb-2">✓ Your Strengths</p>
                  <div className="flex flex-wrap gap-1">
                    {skillGap.strengths.slice(0, 4).map(s => (
                      <span key={s.skill} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100">{s.skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#0a66c2]" /> Recommended for You
              </p>
              <div className="space-y-2">
                {recommendations.slice(0, 4).map(r => (
                  <div key={r._id} className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-semibold text-gray-900 truncate">{r.title}</p>
                    <p className="text-xs text-[#0a66c2]">{r.company}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.matchScore}% match</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">About EduNetChain</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              A blockchain-powered platform connecting students with alumni for verified credentials and career opportunities.
            </p>
            <div className="mt-3 space-y-1.5 text-xs text-gray-500">
              <p>🔗 Blockchain Verified</p>
              <p>🎓 SVPM COE Network</p>
              <p>💼 Real Opportunities</p>
            </div>
          </div>

          {/* Alumni Search */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
              <Search className="w-3.5 h-3.5" /> Connected Alumni
            </p>
            <form onSubmit={searchAlumni} className="flex gap-2 mb-3">
              <input
                value={alumniSearch}
                onChange={e => setAlumniSearch(e.target.value)}
                placeholder="Name or company…"
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0a66c2] bg-white"
              />
              <button type="submit" className="px-3 py-1.5 bg-[#0a66c2] text-white text-xs font-semibold rounded-lg hover:bg-[#004182] transition">Go</button>
            </form>
            {alumniSearched && (
              alumniResults.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">No connected alumni yet.<br/>Apply to posts to connect.</p>
              ) : (
                <div className="space-y-2">
                  {alumniResults.slice(0, 5).map(a => (
                    <div key={a._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 -mx-1 transition" onClick={() => navigate(`/profile/${a._id}`)}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{a.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 truncate">{a.name}</p>
                        <p className="text-xs text-gray-400 truncate">{a.professionalInfo?.currentCompany || "Alumni"}</p>
                      </div>
                      <button onClick={() => navigate("/messages")} className="flex-shrink-0 text-xs text-[#0a66c2] font-semibold hover:underline">Message</button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          <p className="text-xs text-gray-400 px-1">© 2025 EduNetChain · SVPM COE Students</p>
        </aside>
      </main>
    </div>
  );
}
