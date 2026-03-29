import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getInbox, getConversation, sendMessage, getAlumniList } from "../api";
import { Send, Search, ArrowLeft, MoreHorizontal } from "lucide-react";
import Header from "../components/Header";

const Avatar = ({ name, size = "md", color = "blue" }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  const colors = { blue: "from-[#0a66c2] to-[#004182]", green: "from-emerald-500 to-emerald-700", gray: "from-gray-400 to-gray-600" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold">{name?.charAt(0)?.toUpperCase() || "?"}</span>
    </div>
  );
};

export default function Messages() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const location = useLocation();

  const [inbox, setInbox] = useState([]);
  const [alumniList, setAlumniList] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchInbox();
    if (role === "student") fetchAlumniList();
    // Auto-open conversation if navigated from a profile page
    if (location.state?.openUserId) {
      setSelectedUser({
        userId: location.state.openUserId,
        name: location.state.openUserName || "User",
        role: location.state.openUserRole || "alumni",
      });
    }
  }, []);

  useEffect(() => {
    if (selectedUser) fetchConversation(selectedUser.userId);
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setFilteredAlumni(alumniList.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, alumniList]);

  const fetchInbox = async () => {
    try { const res = await getInbox(); setInbox(res.data); } catch {}
  };

  const fetchAlumniList = async () => {
    try { const res = await getAlumniList(); setAlumniList(res.data); setFilteredAlumni(res.data); } catch {}
  };

  const fetchConversation = async (userId) => {
    try {
      setLoading(true);
      const res = await getConversation(userId);
      setMessages(res.data);
      fetchInbox();
    } catch {} finally { setLoading(false); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedUser) return;
    try {
      await sendMessage(selectedUser.userId, newMsg.trim());
      setNewMsg("");
      fetchConversation(selectedUser.userId);
    } catch (err) { alert(err.response?.data?.msg || "Failed to send"); }
  };

  const startNewChat = (alumni) => {
    setSelectedUser({ userId: alumni._id, name: alumni.name, role: "alumni", company: alumni.professionalInfo?.currentCompany, position: alumni.professionalInfo?.currentPosition });
    setShowNewChat(false);
    setSearchQuery("");
  };

  const backPath = role === "alumni" ? "/alumni" : "/dashboard";

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col">
      <Header userRole={role || "student"} userName={user.name || "User"} />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-5 flex gap-4" style={{ height: "calc(100vh - 56px)" }}>

        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {/* Sidebar Header */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-lg">Messaging</h2>
              {role === "student" && (
                <button
                  onClick={() => setShowNewChat(v => !v)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-[#0a66c2] transition text-xl font-light"
                  title="New message"
                >
                  ✏️
                </button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => role === "student" && setShowNewChat(true)}
                className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:bg-white transition"
              />
            </div>
          </div>

          {/* New Chat — Alumni List */}
          {showNewChat && role === "student" && (
            <div className="border-b border-gray-100 max-h-52 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-3 pb-1">Alumni</p>
              {filteredAlumni.length === 0 ? (
                <p className="text-sm text-gray-400 px-4 py-3">No alumni found</p>
              ) : filteredAlumni.map(a => (
                <button key={a._id} onClick={() => startNewChat(a)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left">
                  <Avatar name={a.name} size="sm" color="green" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{a.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {a.professionalInfo?.currentPosition}{a.professionalInfo?.currentCompany ? ` · ${a.professionalInfo.currentCompany}` : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Inbox */}
          <div className="flex-1 overflow-y-auto">
            {inbox.length === 0 && !showNewChat ? (
              <div className="text-center py-12 px-4">
                <p className="text-4xl mb-2">💬</p>
                <p className="text-sm font-semibold text-gray-600">No conversations yet</p>
                {role === "student" && <p className="text-xs text-gray-400 mt-1">Search for an alumni to start chatting</p>}
              </div>
            ) : (
              inbox.map(conv => (
                <button key={conv.userId} onClick={() => { setSelectedUser(conv); setShowNewChat(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition text-left ${selectedUser?.userId === conv.userId ? "bg-blue-50 border-l-4 border-l-[#0a66c2]" : ""}`}>
                  <div className="relative">
                    <Avatar name={conv.name} size="md" color={conv.role === "alumni" ? "green" : "blue"} />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="text-sm font-semibold text-gray-900 truncate">{conv.name}</p>
                      {conv.unread > 0 && (
                        <span className="ml-2 flex-shrink-0 bg-[#0a66c2] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {conv.unread > 9 ? "9+" : conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 capitalize">{conv.role}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden min-w-0">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">Your Messages</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                {role === "student"
                  ? "Connect with alumni for guidance, referrals, and career advice."
                  : "Students will reach out to you for mentorship and opportunities."}
              </p>
              {role === "student" && (
                <button
                  onClick={() => setShowNewChat(true)}
                  className="mt-4 px-6 py-2 bg-[#0a66c2] text-white text-sm font-semibold rounded-full hover:bg-[#004182] transition"
                >
                  Message an Alumni
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 bg-white">
                <button onClick={() => setSelectedUser(null)} className="md:hidden text-gray-400 hover:text-gray-600 mr-1">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <Avatar name={selectedUser.name} size="md" color={selectedUser.role === "alumni" ? "green" : "blue"} />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{selectedUser.name}</p>
                  <p className="text-xs text-gray-500 capitalize truncate">
                    {selectedUser.role}
                    {selectedUser.position ? ` · ${selectedUser.position}` : ""}
                    {selectedUser.company ? ` @ ${selectedUser.company}` : ""}
                  </p>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-white">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-[#0a66c2] border-t-transparent rounded-full" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Avatar name={selectedUser.name} size="lg" color={selectedUser.role === "alumni" ? "green" : "blue"} />
                    <p className="text-gray-700 font-semibold mt-3">{selectedUser.name}</p>
                    <p className="text-gray-400 text-sm mt-1">Say hello! 👋</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.senderId === user.id || msg.senderId?._id === user.id;
                    return (
                      <div key={msg._id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                        {!isMine && <Avatar name={selectedUser.name} size="sm" color={selectedUser.role === "alumni" ? "green" : "blue"} />}
                        <div className={`max-w-xs lg:max-w-md ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? "bg-[#0a66c2] text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-800 rounded-bl-sm"
                          }`}>
                            {msg.content}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {isMine && <Avatar name={user.name || "?"} size="sm" color="blue" />}
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <Avatar name={user.name || "?"} size="sm" color="blue" />
                  <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-[#0a66c2] focus-within:bg-white transition">
                    <input
                      type="text"
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      placeholder="Write a message…"
                      className="flex-1 bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMsg.trim()}
                    className="w-9 h-9 flex items-center justify-center bg-[#0a66c2] text-white rounded-full hover:bg-[#004182] disabled:opacity-30 disabled:cursor-not-allowed transition flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
