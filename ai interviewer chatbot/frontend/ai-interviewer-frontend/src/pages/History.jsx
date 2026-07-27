import React, { useEffect, useState } from "react";
import { getUserSessions, getSessionDetails } from "../services/interviewServices";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/dashboard/DashboardHeader";

export default function History() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await getUserSessions(1);
      setSessions(data || []);
      if (data && data.length > 0) {
        handleSelectSession(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (sessionId) => {
    try {
      const details = await getSessionDetails(sessionId);
      setSelectedSession(details);
    } catch (err) {
      console.error("Failed to fetch session details:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white">
      <DashboardHeader logout={logout} />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              📜 Interview History
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Review your past multi-question interview performances and detailed feedback.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium text-sm transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading interview sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="bg-white/5 border border-white/10 p-10 rounded-3xl text-center space-y-3">
            <p className="text-gray-300 font-semibold text-lg">No past interview sessions found.</p>
            <button
              onClick={() => navigate("/interview")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg"
            >
              Start First Interview
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-12 gap-6 items-start">
            {/* Session List */}
            <div className="md:col-span-5 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
                Completed Sessions ({sessions.length})
              </h2>
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectSession(s.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    selectedSession?.id === s.id
                      ? "bg-gradient-to-r from-blue-900/40 to-slate-900/80 border-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-base">{s.role}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {s.company || "General"} • {s.difficulty}
                      </p>
                    </div>
                    <span className="text-sm font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                      {Math.round((s.average_score || 0) * 10)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-3 text-right">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : "Recent"}
                  </p>
                </div>
              ))}
            </div>

            {/* Session Details */}
            <div className="md:col-span-7">
              {selectedSession ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl space-y-5"
                >
                  <div className="border-b border-white/10 pb-4 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedSession.role} Details</h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Company: <span className="text-white">{selectedSession.company || "General"}</span> • Difficulty: <span className="text-white">{selectedSession.difficulty}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-cyan-400">
                        {Math.round((selectedSession.average_score || 0) * 10)}%
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Overall Score</p>
                    </div>
                  </div>

                  {/* Question & Answer Breakdown */}
                  <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                    {selectedSession.results && selectedSession.results.length > 0 ? (
                      selectedSession.results.map((res, idx) => (
                        <div
                          key={res.id || idx}
                          className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2.5"
                        >
                          <p className="text-sm font-bold text-cyan-300">
                            Q{idx + 1}: {res.question}
                          </p>
                          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <p className="text-xs text-gray-300 italic">"{res.answer}"</p>
                          </div>
                          <div className="flex justify-between items-center pt-1 text-xs">
                            <span className="font-bold text-emerald-400">
                              Score: {Math.round((res.overall_score || 0) * 10)}%
                            </span>
                            <span className="text-gray-400 max-w-[70%] truncate">
                              {res.feedback_text}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm py-4">No individual question results stored for this session.</p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white/5 border border-white/10 p-10 rounded-3xl text-center text-gray-400">
                  Select an interview session from the list to view its complete question breakdown.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}