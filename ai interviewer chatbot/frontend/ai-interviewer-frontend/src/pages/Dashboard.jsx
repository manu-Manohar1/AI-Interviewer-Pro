import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";

import StatsCards from "../components/dashboard/StatsCards";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import InterviewHistory from "../components/dashboard/InterviewHistory";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import QuickActionCard from "../components/dashboard/QuickActionCard";
import AIInsights from "../components/dashboard/AIInsights";
import SkillRadar from "../components/dashboard/SkillRadar";
import RecentInterview from "../components/dashboard/RecentInterview";

import api from "../api/api";
import { getUserSessions } from "../services/interviewServices";

import {
  FaFileUpload,
  FaRobot,
  FaHistory,
  FaChartBar,
  FaUserCircle,
} from "react-icons/fa";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_interviews: 0,
    average_score: 0,
    best_score: 0,
    resumes: 0,
  });

  const [rawSessions, setRawSessions] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const sessionsData = await getUserSessions(1);

        if (!isMounted) return;

        if (Array.isArray(sessionsData) && sessionsData.length > 0) {
          const total = sessionsData.length;
          const avg =
            sessionsData.reduce((acc, curr) => acc + (curr.average_score || 0), 0) / total;
          const best = Math.max(...sessionsData.map((s) => s.average_score || 0));

          setStats({
            total_interviews: total,
            average_score: Math.round(avg * 10),
            best_score: Math.round(best * 10),
            resumes: 1,
          });

          setRawSessions(sessionsData);
        } else {
          const res = await api.get("/interview/stats");
          if (!isMounted) return;

          setStats({
            total_interviews: res.data.total_interviews || 0,
            average_score: Math.round((res.data.average_score || 0) * 10),
            best_score: Math.round(
              (res.data.best_score || res.data.highest_score || 0) * 10
            ),
            resumes: 0,
          });

          const historyRes = await api.get("/interview/history");
          if (!isMounted) return;

          setRawSessions(historyRes.data || []);
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Optimized Memoized Calculations for Chart & Activity List
  const chartData = useMemo(() => {
    const validSessions = rawSessions.filter(
      (s) => (s.average_score || s.overall_score || 0) > 0
    );

    return validSessions.map((item, index) => ({
      name: `#${index + 1}`,
      score: Math.round((item.average_score || item.overall_score || 0) * 10),
    }));
  }, [rawSessions]);

  const recentHistory = useMemo(() => {
    return rawSessions.slice(0, 5);
  }, [rawSessions]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden select-none transform-gpu">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-cyan-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-indigo-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

      <DashboardHeader logout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
        {/* Welcome Banner */}
        <section className="bg-slate-900/60 backdrop-blur-xl sm:backdrop-blur-2xl border border-white/10 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Manohar
              </span>{" "}
              👋
            </h1>
            <p className="text-gray-400 mt-1.5 text-xs sm:text-sm font-medium">
              Ready for today's AI interview? Track your progress and improve every session.
            </p>
          </div>
        </section>

        {/* Latest Interview */}
        <section className="bg-slate-900/60 backdrop-blur-xl sm:backdrop-blur-2xl border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl hover:border-cyan-500/30 transition-all">
          <RecentInterview />
        </section>

        {/* Statistics Cards */}
        <section>
          <StatsCards stats={stats} />
        </section>

        {/* Quick Actions Grid */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            ⚡ Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <QuickActionCard
              to="/resume-analyzer"
              icon={<FaChartBar />}
              title="Resume Analyzer"
              description="Improve ATS score"
              color="from-cyan-500 to-blue-600"
            />

            <QuickActionCard
              to="/resume"
              icon={<FaFileUpload />}
              title="Resume Upload"
              description="Upload Resume"
              color="from-blue-500 to-indigo-600"
            />

            <QuickActionCard
              to="/questions"
              icon={<FaRobot />}
              title="Questions"
              description="Generate Questions"
              color="from-emerald-500 to-teal-600"
            />

            <QuickActionCard
              to="/interview"
              icon={<FaRobot />}
              title="Interview"
              description="Start Interview"
              color="from-rose-500 to-pink-600"
            />

            <QuickActionCard
              to="/results"
              icon={<FaChartBar />}
              title="Reports"
              description="Interview Reports"
              color="from-amber-500 to-orange-500"
            />

            <QuickActionCard
              to="/history"
              icon={<FaHistory />}
              title="History"
              description="Previous Interviews"
              color="from-purple-500 to-indigo-600"
            />

            <QuickActionCard
              to="/settings"
              icon={<FaUserCircle />}
              title="Profile"
              description="Manage Profile"
              color="from-indigo-500 to-violet-600"
            />
          </div>
        </section>

        {/* Analytics & Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <div className="bg-slate-900/60 backdrop-blur-xl sm:backdrop-blur-2xl border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl hover:border-cyan-500/30 transition-all overflow-hidden">
            <PerformanceChart data={chartData} />
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl sm:backdrop-blur-2xl border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl space-y-4 sm:space-y-5 hover:border-cyan-500/30 transition-all">
            <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
              📜 Recent Activity
            </h2>

            <div className="space-y-2.5 sm:space-y-3">
              {recentHistory.length > 0 ? (
                recentHistory.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center justify-between p-3 sm:p-3.5 bg-black/40 rounded-xl sm:rounded-2xl border border-white/5 hover:border-white/10 transition-all gap-2"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0 shadow-md shadow-cyan-400/50" />
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs sm:text-sm truncate">
                          {item.role || "Interview"} Completed
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-gray-400">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 sm:px-3 py-1 rounded-full border border-cyan-500/20 shrink-0">
                      Score: {Math.round((item.average_score || item.overall_score || 0) * 10)}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-xs py-4 text-center">
                  No interview history found.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Interview History */}
        <section className="bg-slate-900/60 backdrop-blur-xl sm:backdrop-blur-2xl border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl hover:border-cyan-500/30 transition-all overflow-x-auto">
          <InterviewHistory />
        </section>

        {/* Bottom Widgets */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <div className="bg-slate-900/60 backdrop-blur-xl sm:backdrop-blur-2xl border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl hover:border-cyan-500/30 transition-all">
            <AIInsights />
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl sm:backdrop-blur-2xl border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl hover:border-cyan-500/30 transition-all overflow-hidden">
            <SkillRadar />
          </div>
        </section>
      </main>
    </div>
  );
}