import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { FaUserTie, FaEnvelope, FaBriefcase, FaChartLine, FaUserEdit } from "react-icons/fa";

export default function Profile() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white">
      <DashboardHeader logout={logout} />

      <main className="max-w-3xl mx-auto px-6 py-12 flex justify-center">
        <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 space-y-8 relative overflow-hidden">
          {/* Subtle Ambient Light Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Professional Header / Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-white/10 pb-8">
            {/* Profile Emoji / Icon Avatar Badge */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl text-white shadow-xl shadow-cyan-500/20 border border-white/20">
                👨‍💼
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-slate-900" title="Active" />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h1 className="text-3xl font-extrabold text-white">
                Manohar
              </h1>
              <p className="text-cyan-400 font-semibold text-sm">
                AI / ML Student
              </p>
              <p className="text-xs text-gray-400">
                AI Interviewer Pro Member
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name Card */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg">
                <FaUserTie />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Full Name
                </label>
                <p className="text-sm font-semibold text-white mt-0.5">
                  Manohar
                </p>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-lg">
                <FaEnvelope />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Email
                </label>
                <p className="text-sm font-semibold text-white mt-0.5">
                  example@email.com
                </p>
              </div>
            </div>

            {/* Role Card */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-lg">
                <FaBriefcase />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Role
                </label>
                <p className="text-sm font-semibold text-white mt-0.5">
                  Student
                </p>
              </div>
            </div>

            {/* Total Interviews Card */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
                <FaChartLine />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Total Interviews
                </label>
                <p className="text-sm font-extrabold text-emerald-400 mt-0.5">
                  12 Sessions Completed
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium text-xs transition-all"
            >
              ← Back to Dashboard
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <FaUserEdit />
              Edit Profile
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}