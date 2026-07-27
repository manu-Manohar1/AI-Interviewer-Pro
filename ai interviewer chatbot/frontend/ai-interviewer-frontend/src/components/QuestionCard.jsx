import React from "react";

export default function QuestionCard({ question }) {
  return (
    <div
      className="
        bg-slate-900/60
        backdrop-blur-xl
        border border-white/10
        rounded-3xl
        p-6
        text-white
        shadow-xl
        hover:border-cyan-500/40
        transition-all
        duration-300
        select-none
        transform-gpu
      "
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <span>❓</span> Question Card
        </h2>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          AI Generated
        </span>
      </div>

      {/* Question Content */}
      <div className="rounded-2xl bg-black/40 border border-white/5 p-4 mt-2">
        <p className="text-sm md:text-base font-medium leading-relaxed text-gray-100">
          {question || (
            <span className="italic text-gray-500 flex items-center gap-2">
              <span>⏳</span> No question available...
            </span>
          )}
        </p>
      </div>
    </div>
  );
}