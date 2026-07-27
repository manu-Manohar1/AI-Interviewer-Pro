import React from "react";

export default function CurrentQuestionPanel({
  question,
  questionNo,
  total,
  company,
  role,
  difficulty,
  round,
  interviewState,
}) {
  const progress = total > 0 ? (questionNo / total) * 100 : 0;

  return (
    <div
      className="
        bg-slate-900/60
        backdrop-blur-xl
        border border-white/10
        rounded-3xl
        shadow-xl
        overflow-hidden
        hover:border-cyan-500/40
        transition-all
        duration-300
        select-none
        transform-gpu
      "
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 px-5 py-3.5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              🤖 Current Question
            </h2>
            <p className="text-cyan-100 text-xs">
              Question {questionNo} of {total}
            </p>
          </div>

          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md transition-all ${
                interviewState === "speaking"
                  ? "bg-blue-500/20 text-blue-200 border-blue-400/30 animate-pulse"
                  : interviewState === "listening"
                  ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30 animate-pulse"
                  : interviewState === "transcribing"
                  ? "bg-amber-500/20 text-amber-200 border-amber-400/30"
                  : interviewState === "evaluating"
                  ? "bg-purple-500/20 text-purple-200 border-purple-400/30"
                  : interviewState === "completed"
                  ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/30"
                  : "bg-gray-500/20 text-gray-300 border-white/10"
              }`}
            >
              {interviewState === "speaking" && "🗣 Speaking"}
              {interviewState === "listening" && "🎤 Listening"}
              {interviewState === "transcribing" && "✍ Transcribing"}
              {interviewState === "evaluating" && "🧠 Evaluating"}
              {interviewState === "completed" && "✅ Completed"}
              {interviewState === "idle" && "💤 Waiting"}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-5 pt-4">
        <div className="flex justify-between text-xs mb-1.5 font-semibold">
          <span className="text-gray-400">Progress Tracker</span>
          <span className="text-cyan-400 font-bold">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between mt-1.5 text-[11px] font-medium">
          <span className="text-cyan-300">
            {questionNo} / {total}
          </span>
          <span className="text-gray-400">
            Completed
          </span>
        </div>
      </div>

      {/* Glassmorphism Metadata Tags */}
      <div className="flex flex-wrap gap-2 px-5 py-3">
        {company && (
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
            🏢 {company}
          </span>
        )}

        {role && (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            💼 {role}
          </span>
        )}

        {round && (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            📋 {round}
          </span>
        )}

        {difficulty && (
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            🎯 {difficulty}
          </span>
        )}
      </div>

      {/* Question Text Box */}
      <div className="mx-5 mb-5 rounded-2xl bg-black/40 border border-white/10 p-4">
        <h3 className="text-cyan-400 font-bold text-xs uppercase tracking-wider mb-2">
          Interview Question
        </h3>

        <p className="text-sm md:text-base leading-relaxed font-medium text-white">
          {question || "Loading question..."}
        </p>
      </div>
    </div>
  );
}