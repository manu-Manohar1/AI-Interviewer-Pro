import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

export default function DashboardHeader({ logout }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-6">
        {/* Left Branding (Clickable to Home/Dashboard) */}
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
            🤖
          </div>

          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              AI Interviewer Pro
            </h1>
            <p className="text-xs text-gray-400">
              AI Powered Interview Practice
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Notification Button */}
          <button
            onClick={() => alert("No new notifications")}
            className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
            title="Notifications"
          >
            <FaBell className="text-base" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          </button>

          {/* Profile Badge (Clickable to Profile/Settings) */}
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 transition-all hover:scale-105 active:scale-95"
            title="Manage Profile"
          >
            <FaUserCircle className="text-3xl text-cyan-400" />
            <div className="hidden md:block text-left">
              <p className="font-bold text-xs text-white">
                Manohar
              </p>
              <p className="text-[10px] text-gray-400">
                AI/ML Student
              </p>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all shadow-md hover:scale-105 active:scale-95"
          >
            <FaSignOutAlt className="text-xs" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}