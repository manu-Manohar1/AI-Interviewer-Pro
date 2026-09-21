import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { FaCloudUploadAlt, FaUser, FaGraduationCap, FaBriefcase, FaFileUpload } from "react-icons/fa";
import { getErrorMessage } from "../utils/errorMessage";

export default function ResumeUpload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a resume.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const formData = new FormData();
      // Field name must be "resume" -- that's what the backend's
      // /resume/analyze endpoint actually expects (UploadFile = File(...)
      // parameter is named `resume`).
      formData.append("resume", file);

      const response = await api.post("/resume/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(getErrorMessage(error));
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
            🚀 Resume Upload & Profile Builder
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Fill in your profile details and upload your resume to generate targeted AI interview questions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Details */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaUser className="text-cyan-400" />
              Personal Details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="email"
                placeholder="Email"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="text"
                placeholder="Phone Number"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="date"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <select className="bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all">
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="text"
                placeholder="Address"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="text"
                placeholder="LinkedIn URL"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="text"
                placeholder="GitHub URL"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />
            </div>
          </div>

          {/* Educational Details */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaGraduationCap className="text-blue-400" />
              Educational Details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="College / University"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="text"
                placeholder="Degree"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="text"
                placeholder="Branch / Specialization"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="number"
                placeholder="Graduation Year"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="text"
                placeholder="CGPA"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="text"
                placeholder="Current Semester"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="text"
                placeholder="10th Percentage"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="text"
                placeholder="12th Percentage"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />
            </div>
          </div>

          {/* Career Details */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaBriefcase className="text-emerald-400" />
              Career Details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Target Job Role"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="text"
                placeholder="Experience (Years)"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="text"
                placeholder="Skills (e.g. React, Python, ML)"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <input
                type="text"
                placeholder="Programming Languages"
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />

              <select className="bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all">
                <option value="">Interview Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Upload Resume File */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaFileUpload className="text-amber-400" />
              Upload Resume File
            </h2>

            <div className="relative border-2 border-dashed border-white/20 hover:border-cyan-500/50 rounded-2xl p-6 text-center bg-black/30 transition-all duration-200 group cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <FaCloudUploadAlt className="text-4xl text-cyan-400 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-white">
                  {file ? file.name : "Click or drag & drop to attach resume"}
                </p>
                <p className="text-xs text-gray-400">Supported formats: .PDF, .DOC, .DOCX</p>
              </div>
            </div>

            {file && (
              <p className="text-xs font-semibold text-emerald-400">
                ✓ Attached: {file.name}
              </p>
            )}

            {errorMessage && (
              <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                ⚠ {errorMessage}
              </p>
            )}
          </div>

          {/* Analysis Results */}
          {result && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ✅ Resume Analysis Complete
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Overall Score</p>
                  <p className="text-3xl font-black text-emerald-400">{result.score}%</p>
                </div>
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">ATS Keyword Match</p>
                  <p className="text-3xl font-black text-cyan-400">{result.keywordMatch}%</p>
                </div>
              </div>

              {result.strengths?.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-emerald-400 mb-1">Strengths</p>
                  <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                    {result.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.missingSkills?.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-amber-400 mb-1">Missing Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((sk, i) => (
                      <span key={i} className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full px-3 py-1">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.suggestions && (
                <div>
                  <p className="text-sm font-bold text-cyan-400 mb-1">Suggestions</p>
                  <p className="text-sm text-gray-300">{result.suggestions}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium text-sm transition-all"
            >
              ← Back to Dashboard
            </button>

            {result ? (
              <button
                type="button"
                onClick={() => navigate("/questions")}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
              >
                Continue to Questions →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
              >
                {loading ? "Analyzing Resume..." : "Analyze Resume →"}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
