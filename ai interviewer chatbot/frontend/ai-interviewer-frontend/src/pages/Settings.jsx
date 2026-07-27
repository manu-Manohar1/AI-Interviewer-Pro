import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { FaUser, FaEnvelope, FaGraduationCap, FaCog, FaArrowLeft } from "react-icons/fa";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    college: "",
  });
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/profile/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setUser(res.data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white">
      <DashboardHeader logout={logout} />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Title Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
              <FaCog className="text-cyan-400 text-2xl" />
              Account Settings
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              View and manage your account details and interview preferences.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold transition-all"
          >
            <FaArrowLeft />
            Dashboard
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Profile Header Avatar */}
          <div className="flex items-center gap-5 border-b border-white/10 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl text-white shadow-lg shadow-cyan-500/20 border border-white/20">
              👨‍💼
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                {user.name || "User Profile"}
              </h2>
              <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                {user.email || "AI Interviewer Member"}
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-6 text-sm">
              Loading settings...
            </p>
          ) : (
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FaUser className="text-cyan-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={user.name || ""}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-not-allowed"
                  readOnly
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FaEnvelope className="text-blue-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-not-allowed"
                  readOnly
                />
              </div>

              {/* College / Institution */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FaGraduationCap className="text-purple-400" />
                  College / Institution
                </label>
                <input
                  type="text"
                  value={user.college || "Not Specified"}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium text-xs transition-all"
            >
              ← Back to Dashboard
            </button>

            <button
              onClick={logout}
              className="px-6 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs transition-all shadow-md active:scale-95"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}