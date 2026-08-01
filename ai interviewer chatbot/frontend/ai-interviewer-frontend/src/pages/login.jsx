import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGoogle, FaGithub, FaEye, FaEyeSlash, FaLock, FaEnvelope } from "react-icons/fa";
import api from "../api/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' | 'github' | null
  const [error, setError] = useState("");

  // Handle incoming OAuth Token Redirects (e.g. /login?token=XYZ or /auth/callback?token=XYZ)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token") || queryParams.get("access_token");
    const oauthError = queryParams.get("error");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard", { replace: true });
    } else if (oauthError) {
      setError(oauthError || "OAuth authentication failed. Please try again.");
    }
  }, [location, navigate]);

  // Handle OAuth Redirect Triggers
  const handleOAuthLogin = (provider) => {
    setOauthLoading(provider);
    setError("");

    // Get API Base URL from Axios instance or environment
    const API_BASE_URL = api.defaults.baseURL || "http://localhost:8000/api/v1";

    // Direct user to your backend OAuth authorization URL
    // The backend handles state, consent, and redirects back to React with the JWT token
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let res;

      // First attempt standard JSON login
      try {
        res = await api.post("/auth/login", { email, password });
      } catch (jsonErr) {
        // Fallback for OAuth2 Password Bearer endpoints expecting x-www-form-urlencoded
        const params = new URLSearchParams();
        params.append("username", email);
        params.append("password", password);

        res = await api.post("/auth/login", params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
      }

      if (res.data?.access_token || res.data?.token) {
        const token = res.data.access_token || res.data.token;
        localStorage.setItem("token", token);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);
      const detail = err.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail) && detail.length > 0) {
        const firstErr = detail[0];
        const fieldName = firstErr.loc ? firstErr.loc[firstErr.loc.length - 1] : "";
        setError(`${fieldName ? fieldName + ": " : ""}${firstErr.msg || "Invalid input"}`);
      } else if (typeof detail === "object" && detail !== null) {
        setError(detail.msg || "An unexpected error occurred.");
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white relative overflow-x-hidden p-4 select-none">
      {/* Dynamic Animated Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-cyan-500/15 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/15 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl sm:backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl z-10 relative"
      >
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="relative group w-12 h-12 mx-auto mb-3">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 blur-md opacity-75 group-hover:opacity-100 transition animate-pulse" />
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center border border-white/20 shadow-lg overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/bottts/svg?seed=InterviewerPro&backgroundColor=b6e3f4"
                alt="AI Avatar"
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
            AI Interviewer Pro
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            Enterprise Interview Prep Platform
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-bold capitalize leading-relaxed">
            {String(error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
              Work Email
            </label>
            <div className="relative flex items-center">
              <FaEnvelope className="absolute left-3.5 text-gray-500 text-xs" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-cyan-400 hover:underline font-semibold"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative flex items-center">
              <FaLock className="absolute left-3.5 text-gray-500 text-xs" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-gray-500 hover:text-white transition"
              >
                {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-black/50 border-white/10 text-cyan-500 focus:ring-0"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !!oauthLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign In to Platform"
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-slate-900 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Or continue with
          </span>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            disabled={loading || !!oauthLoading}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
          >
            {oauthLoading === "google" ? (
              <span className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaGoogle className="text-xs text-rose-400" />
            )}
            Google
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin("github")}
            disabled={loading || !!oauthLoading}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
          >
            {oauthLoading === "github" ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaGithub className="text-xs" />
            )}
            GitHub
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-cyan-400 font-bold hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}