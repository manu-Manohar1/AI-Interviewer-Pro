import React from "react";
import Sidebar from "../components/Sidebar";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { FaDownload, FaShareAlt, FaRedo, FaTrophy, FaComments, FaCode, FaBrain } from "react-icons/fa";

export default function Results() {
  const radarData = [
    { subject: "Technical", A: 85 },
    { subject: "Communication", A: 90 },
    { subject: "Grammar", A: 95 },
    { subject: "Confidence", A: 80 },
    { subject: "Problem Solving", A: 75 },
    { subject: "Behavioral", A: 88 },
  ];

  const barData = [
    { name: "Q1", score: 8.5 },
    { name: "Q2", score: 9.0 },
    { name: "Q3", score: 7.8 },
    { name: "Q4", score: 9.2 },
    { name: "Q5", score: 8.8 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex select-none transform-gpu">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/40 to-black">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          {/* Header Banner */}
          <div className="flex flex-wrap justify-between items-center pb-4 border-b border-white/10 gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                📊 Interview Analytics Report
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Session ID: #AI-SESSION-88492 • Role: Software Engineer
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold border border-white/10 flex items-center gap-2 transition active:scale-95"
              >
                <FaShareAlt /> Share
              </button>
              <button
                type="button"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-extrabold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition active:scale-95"
              >
                <FaDownload /> Download PDF
              </button>
            </div>
          </div>

          {/* Quick Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 backdrop-blur-2xl shadow-xl">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm mb-3">
                <FaTrophy />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Overall Score</p>
              <p className="text-2xl font-black text-cyan-400 mt-0.5">86%</p>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 backdrop-blur-2xl shadow-xl">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm mb-3">
                <FaCode />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Technical Score</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">8.5 / 10</p>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 backdrop-blur-2xl shadow-xl">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm mb-3">
                <FaComments />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Communication</p>
              <p className="text-2xl font-black text-indigo-400 mt-0.5">9.0 / 10</p>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 backdrop-blur-2xl shadow-xl">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm mb-3">
                <FaBrain />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Confidence Level</p>
              <p className="text-2xl font-black text-amber-400 mt-0.5">High</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Competency Radar */}
            <div className="col-span-12 lg:col-span-6 bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl">
              <h3 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider mb-4">
                Competency Skill Radar
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                    <Radar name="Candidate" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Question Breakdown Bar Chart */}
            <div className="col-span-12 lg:col-span-6 bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl">
              <h3 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider mb-4">
                Question Breakdown Scores
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="score" fill="#0284c7" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={() => (window.location.href = "/interview")}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-extrabold text-xs text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 active:scale-95 transition"
            >
              <FaRedo /> Practice Another Session
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}