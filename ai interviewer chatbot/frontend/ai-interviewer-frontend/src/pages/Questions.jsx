import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import {
  FaSlidersH,
  FaQuestionCircle,
  FaPlay,
  FaCheckCircle,
} from "react-icons/fa";

export default function Questions() {
  const navigate = useNavigate();

  const [company, setCompany] = useState("General");
  const [round, setRound] = useState("Technical");
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
        company,
        round,
        job_role: jobRole,
        difficulty,
        count: Number(count),
      });

      setQuestions(response.data);
    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(error.response.data.detail || "Failed to generate questions.");
      } else {
        alert("Unable to connect to server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white">
      <DashboardHeader logout={logout} />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            ❓ AI Question Bank Generator
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Customize your interview preferences to generate AI interview
            questions.
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaSlidersH className="text-cyan-400" />
            Interview Preferences
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            {/* Company */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2">
                Company
              </label>

              <select
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              >
                <option value="General">General</option>
                <option value="Google">Google</option>
                <option value="Amazon">Amazon</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Meta">Meta</option>
                <option value="Apple">Apple</option>
                <option value="Netflix">Netflix</option>
                <option value="Infosys">Infosys</option>
                <option value="TCS">TCS</option>
                <option value="Wipro">Wipro</option>
                <option value="Accenture">Accenture</option>
              </select>
            </div>

            {/* Interview Round */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2">
                Interview Round
              </label>

              <select
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3"
                value={round}
                onChange={(e) => setRound(e.target.value)}
              >
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Managerial">Managerial</option>
              </select>
            </div>

            {/* Job Role */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2">
                Job Role
              </label>

              <select
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
              >
                <option value="AI Engineer">AI Engineer</option>
                <option value="Python Developer">Python Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">
                  Full Stack Developer
                </option>
                <option value="Machine Learning Engineer">
                  Machine Learning Engineer
                </option>
                <option value="Data Scientist">Data Scientist</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2">
                Difficulty
              </label>

              <select
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>{/* Number of Questions */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2">
                Number of Questions
              </label>

              <select
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3"
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold transition disabled:opacity-50"
          >
            {loading ? "Generating Questions..." : "Generate Questions"}
          </button>
        </div>

        {questions.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaQuestionCircle className="text-cyan-400" />
                Generated Questions ({questions.length})
              </h2>

              <button
                onClick={() => navigate("/interview")}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-bold flex items-center gap-2"
              >
                <FaPlay />
                Start Interview
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, index) => (
                <div
                  key={index}
                  className="bg-slate-900/60 border border-white/10 rounded-2xl p-5"
                >
                  <h3 className="font-bold text-white">
                    {index + 1}. {q.question}
                  </h3>

                  <div className="flex gap-3 mt-4 text-sm">
                    <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300">
                      {q.type || "Technical"}
                    </span>

                    <span className="px-3 py-1 rounded-lg bg-white/10">
                      {q.difficulty || difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => navigate("/interview")}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-bold flex items-center gap-2"
              >
                <FaCheckCircle />
                Proceed to Live Interview
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}