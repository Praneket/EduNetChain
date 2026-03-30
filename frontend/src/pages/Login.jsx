import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../api"; // <-- connect to backend API

const logoSvg = (
  <svg viewBox="0 0 200 200" className="w-16 h-16">
    <defs>
      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066CC" />
        <stop offset="100%" stopColor="#004499" />
      </linearGradient>
    </defs>
    <path
      d="M 100 20 L 140 45 L 140 100 C 140 130 120 155 100 165 C 80 155 60 130 60 100 L 60 45 Z"
      fill="url(#blueGrad)"
    />
    <rect x="85" y="55" width="30" height="35" rx="3" fill="white" opacity="0.95" />
    <line
      x1="92"
      y1="62"
      x2="92"
      y2="82"
      stroke="#0066CC"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="108"
      y1="62"
      x2="108"
      y2="82"
      stroke="#0066CC"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await login({ email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("storage"));
      const r = res.data.user.role;
      if (r === "recruiter") navigate("/recruiter");
      else navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between items-center p-12 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center flex flex-col items-center">
          <div className="mb-8">{logoSvg}</div>
          <h1 className="text-4xl font-bold text-blue-900 mb-6">EDUNETCHAIN</h1>
          <p className="text-lg italic text-blue-600 max-w-sm leading-relaxed font-medium">
            Welcome to EduNetChain, a dedicated platform designed to strengthen
            the bond between our college's students and alumni.
          </p>
          <p className="text-sm italic text-blue-600 max-w-sm mt-6 leading-relaxed">
            Here, verified students and alumni can connect, collaborate, and
            grow together — all within a trusted and secure environment.
          </p>
        </div>

        <div className="text-center text-sm text-blue-900 font-medium">
          <p>© 2025 EduNetChain | Created by SVPM COE Students</p>
          <p className="text-blue-700 mt-1">
            Empowering Student–Alumni Interaction
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center justify-center mb-8">
            {logoSvg}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-8">
              Login To Your Account
            </h2>

            <form onSubmit={handleSignIn} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email to continue.."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-blue-50 border border-blue-100 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md transition"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-blue-50 border border-blue-100 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md pr-10 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 mt-8"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Register & Admin Login Links */}
            <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
              <p>
                Don’t have an account?{" "}
                <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Register as Student
                </a>
              </p>
              <p>
                <a href="/alumni-login" className="text-green-600 hover:text-green-700 font-semibold">
                  Alumni Login
                </a>
                {" | "}
                <a
                  href="/admin-login"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Login as Admin
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
