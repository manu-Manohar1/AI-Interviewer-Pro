import React from "react";

export default function ChatConversation({
  question,
  answer,
}) {
  return (
    <div
      className="
        bg-slate-900/60
        backdrop-blur-xl
        border border-white/10
        rounded-3xl
        shadow-xl
        hover:border-cyan-500/40
        transition-all
        duration-300
        p-5
        select-none
        transform-gpu
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">💬</span>
          <div>
            <h2 className="text-base font-bold text-white">
              Conversation
            </h2>
            <p className="text-[11px] text-gray-400">
              Live AI Interview Transcript
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] text-cyan-400 font-bold tracking-wider">
            LIVE
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* AI Question */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm text-white shadow-md shadow-cyan-500/20 shrink-0">
            🤖
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-cyan-400 font-bold text-xs">
                AI Interviewer
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Question
              </span>
            </div>

            <div className="rounded-2xl rounded-tl-sm bg-black/40 border border-white/10 p-3.5 shadow-sm">
              <p className="text-xs leading-relaxed text-gray-100">
                {question || "Loading question..."}
              </p>
            </div>
          </div>
        </div>

        {/* User Answer */}
        <div className="flex items-start gap-3 justify-end">
          <div className="flex-1">
            <div className="flex justify-end items-center gap-2 mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Answer
              </span>
              <span className="text-xs font-bold text-emerald-400">
                You
              </span>
            </div>

            <div className="rounded-2xl rounded-tr-sm bg-black/40 border border-white/10 p-3.5 min-h-[70px] max-h-[130px] overflow-y-auto custom-scrollbar">
              <p className="text-xs leading-relaxed text-gray-100 whitespace-pre-wrap">
                {answer || (
                  <span className="italic text-gray-500">
                    🎤 Waiting for your speech or typed answer...
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm text-white shadow-md shadow-emerald-500/20 shrink-0">
            👨‍💼
          </div>
        </div>
      </div>
    </div>
  );
}