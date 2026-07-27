import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaChartPie, FaFileCode, FaFileUpload, FaRobot, 
  FaMicrophone, FaCommentDots, FaPoll, FaHistory, 
  FaTrophy, FaMedal, FaCog, FaSignOutAlt 
} from "react-icons/fa";

export default function Sidebar() {
  const location = useLocation();

  const navGroups = [
    {
      title: "Core Platform",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: FaChartPie },
        { label: "Mock Interview", path: "/interview", icon: FaRobot },
        { label: "Voice Session", path: "/voice-interview", icon: FaMicrophone },
        { label: "AI Feedback", path: "/feedback", icon: FaCommentDots },
      ],
    },
    {
      title: "Tools & Analytics",
      items: [
        { label: "Resume Analyzer", path: "/resume-analyzer", icon: FaFileCode },
        { label: "Resume Upload", path: "/resume", icon: FaFileUpload },
        { label: "Question Generator", path: "/questions", icon: FaRobot },
        { label: "Reports", path: "/results", icon: FaPoll },
        { label: "History", path: "/history", icon: FaHistory },
      ],
    },
    {
      title: "Community & Settings",
      items: [
        { label: "Leaderboard", path: "/leaderboard", icon: FaTrophy },
        { label: "Achievements", path: "/achievements", icon: FaMedal },
        { label: "Settings", path: "/settings", icon: FaCog },
      ],
    },
  ];

  return (
    <aside className="w-64 h-screen bg-surface-200/90 backdrop-blur-2xl border-r border-white/10 p-5 flex flex-col justify-between text-white fixed left-0 top-0 z-50 select-none transform-gpu">
      <div className="space-y-6 overflow-y-auto custom-scrollbar">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-blue-600 flex items-center justify-center text-lg font-black shadow-glow shrink-0">
            🤖
          </div>
          <div>
            <h2 className="font-extrabold text-sm leading-tight bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">
              AI Interviewer Pro
            </h2>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Enterprise v2.4</p>
          </div>
        </div>

        {/* Navigation Sections */}
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              {group.title}
            </p>
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-r from-brand-500/20 to-blue-600/20 text-brand-400 border border-brand-500/30 shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="text-sm shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Profile & Logout */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
            M
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">Manohar</p>
            <p className="text-[10px] text-gray-400 truncate">AI / ML Engineer</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <FaSignOutAlt className="text-xs" /> Logout
        </button>
      </div>
    </aside>
  );
}