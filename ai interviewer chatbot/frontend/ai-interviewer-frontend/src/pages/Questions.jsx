import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { FaSlidersH, FaQuestionCircle, FaPlay, FaCheckCircle } from "react-icons/fa";

export default function Questions() {
  const navigate = useNavigate();

  const [jobRole, setJobRole] = useState("AI Engineer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const generateQuestions = async () => {
    setLoading(true);

    try {
      const response = await api.post("/questions/generate", {
        job_role: jobRole,
        difficulty: difficulty,
        count: Number(count),
      });

      setQuestions(response.data || []);
    } catch (error) {
      console.error("Failed to generate questions:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white">
      <DashboardHeader logout={logout} />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            ❓ AI Question Bank Generator
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Customize your interview preferences to generate tailored practice questions before starting your session.
          </p>
        </div>

        {/* Preferences Form Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FaSlidersH className="text-cyan-400" />
            Interview Preferences
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Role */}
            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                Job Role
              </label>
              <select
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
              >
                <option value="AI Engineer">AI Engineer</option>
                <option value="Python Developer">Python Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                Difficulty Level
              </label>
              <select
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Question Count */}
            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                Number of Questions
              </label>
              <select
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateQuestions}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all duration-200 disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? "Generating Practice Questions..." : "Generate Questions"}
          </button>
        </div>

        {/* Question List Results */}
        {questions.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaQuestionCircle className="text-cyan-400" />
                Generated Question Set ({questions.length})
              </h2>

              <button
                onClick={() => navigate("/interview")}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <FaPlay className="text-xs" />
                Start Live Interview
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, index) => (
                <div
                  key={index}
                  className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3 hover:border-cyan-500/30 transition-all"
                >
                  <h3 className="font-bold text-white text-base leading-snug">
                    {index + 1}. {q.question}
                  </h3>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-lg font-medium">
                      Type: {q.type || "Technical"}
                    </span>
                    <span className="bg-white/5 text-gray-300 border border-white/10 px-3 py-1 rounded-lg font-medium">
                      Difficulty: {q.difficulty || difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => navigate("/interview")}
                className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <FaCheckCircle />
                Proceed to Live AI Interview
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}