import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Settings, MessageCircle, Home, Briefcase, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { getUnreadCount, getNotifications, markNotificationsRead } from "../api";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu.jsx";

const logoSvg = (
  <svg viewBox="0 0 200 200" className="w-8 h-8">
    <defs>
      <linearGradient id="blueGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0a66c2" />
        <stop offset="100%" stopColor="#004182" />
      </linearGradient>
    </defs>
    <path
      d="M 100 20 L 140 45 L 140 100 C 140 130 120 155 100 165 C 80 155 60 130 60 100 L 60 45 Z"
      fill="url(#blueGrad2)"
    />
    <rect x="85" y="55" width="30" height="35" rx="3" fill="white" opacity="0.95" />
    <line x1="92" y1="62" x2="92" y2="82" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" />
    <line x1="108" y1="62" x2="108" y2="82" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function Header({ userRole = "student", userName = "User", userAvatar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  useEffect(() => {
    getUnreadCount().then(res => setUnread(res.data.count)).catch(() => {});
    getNotifications().then(res => setNotifications(res.data || [])).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then(res => setUnread(res.data.count)).catch(() => {});
      getNotifications().then(res => setNotifications(res.data || [])).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBellClick = async () => {
    setShowNotifs(v => !v);
    if (unreadNotifs > 0) {
      await markNotificationsRead().catch(() => {});
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const homePath = userRole === "alumni" ? "/alumni" : "/dashboard";

  const navItems = userRole === "student"
    ? [
        { label: "Home", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
        { label: "Jobs", path: "/dashboard", icon: <Briefcase className="w-5 h-5" /> },
        { label: "Messages", path: "/messages", icon: <MessageCircle className="w-5 h-5" />, badge: unread },
      ]
    : [
        { label: "Home", path: "/alumni", icon: <Home className="w-5 h-5" /> },
        { label: "Messages", path: "/messages", icon: <MessageCircle className="w-5 h-5" />, badge: unread },
      ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo + Search */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to={homePath} className="flex items-center gap-1">
              {logoSvg}
              <span className="text-xl font-bold text-[#0a66c2] hidden sm:inline tracking-tight">EduNetChain</span>
            </Link>
          </div>

          {/* Nav Icons */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path + item.label}
                to={item.path}
                className={`relative flex flex-col items-center px-4 py-1 rounded-md text-xs font-medium transition-colors min-w-[56px] ${
                  isActive(item.path)
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span className="relative">
                  {item.icon}
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </span>
                <span className="hidden md:inline mt-0.5">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right — Notifications + Avatar Dropdown */}
          <div className="flex items-center gap-2">
            {/* Notifications Bell */}
            <div className="relative">
              <button onClick={handleBellClick}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-md hover:bg-gray-100 transition">
                <div className="relative">
                  <Bell className="w-5 h-5 text-gray-500" />
                  {unreadNotifs > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {unreadNotifs > 9 ? "9+" : unreadNotifs}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 hidden md:inline">Notifications</span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="font-bold text-gray-900 text-sm">Notifications</p>
                    <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600 text-xs">Close</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-8">No notifications yet</p>
                    ) : notifications.slice(0, 10).map((n, i) => (
                      <div key={i} className={`px-4 py-3 border-b border-gray-50 ${!n.read ? "bg-blue-50" : ""}`}>
                        <p className="text-sm text-gray-800">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DropdownMenu
              trigger={
                <button className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-md hover:bg-gray-100 transition">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center overflow-hidden border-2 border-white shadow">
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-sm">{userName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 hidden md:flex items-center gap-0.5 font-medium">
                    Me <span className="text-[10px]">▾</span>
                  </span>
                </button>
              }
            >
              {/* Mini profile card inside dropdown */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center">
                    <span className="text-white font-bold">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                    <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(userRole === "alumni" ? "/alumni-profile" : "/profile")}
                  className="mt-3 w-full border border-[#0a66c2] text-[#0a66c2] text-sm font-semibold py-1.5 rounded-full hover:bg-blue-50 transition"
                >
                  View Profile
                </button>
              </div>
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
              <DropdownMenuItem
                icon={<Settings size={16} />}
                onClick={() => navigate(userRole === "alumni" ? "/alumni-profile" : "/profile")}
              >
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem icon={<LogOut size={16} />} danger onClick={handleLogout}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
