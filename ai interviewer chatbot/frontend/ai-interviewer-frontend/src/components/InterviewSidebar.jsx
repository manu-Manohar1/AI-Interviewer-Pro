import React from "react";
import AIAvatar from "./AIAvatar";
import VoiceWave from "./VoiceWave";

export default function InterviewSidebar({
  speaking,
  recording,
  interviewState,
}) {
  return (
    <div
      className="
        bg-slate-900/60
        backdrop-blur-xl
        border border-white/10
        rounded-3xl
        p-4
        space-y-4
        shadow-xl
        select-none
        transform-gpu
      "
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-base font-extrabold text-white tracking-wide flex items-center justify-center gap-1.5">
          🤖 AI Assistant
        </h2>

        <p
          className={`text-xs font-semibold transition-colors duration-300 ${
            interviewState === "speaking"
              ? "text-blue-400"
              : interviewState === "listening"
              ? "text-emerald-400"
              : interviewState === "evaluating"
              ? "text-purple-400"
              : interviewState === "transcribing"
              ? "text-amber-400"
              : "text-gray-400"
          }`}
        >
          {interviewState === "speaking" && "🗣 AI Speaking"}
          {interviewState === "listening" && "🎤 Listening..."}
          {interviewState === "evaluating" && "🧠 Evaluating..."}
          {interviewState === "transcribing" && "✍️ Transcribing..."}
          {interviewState === "idle" && "💤 Waiting"}
          {!interviewState && "💤 Ready"}
        </p>
      </div>

      {/* Enlarged Avatar Section */}
      <div className="flex justify-center items-center py-2 transform-gpu">
        <AIAvatar
          speaking={speaking}
          recording={recording}
          interviewState={interviewState}
        />
      </div>

      {/* Voice Wave Visualization */}
      <div className="pt-2 border-t border-white/5 space-y-2">
        <p className="text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
          🎤 Voice Activity
        </p>

        <div className="bg-black/30 border border-white/5 rounded-2xl p-2.5 flex items-center justify-center min-h-[48px]">
          <VoiceWave state={interviewState} />
        </div>
      </div>
    </div>
  );
}