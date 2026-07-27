import React from "react";
import TimerCard from "./TimerCard";
import ConfidenceMeter from "./ConfidenceMeter";
import EmotionMeter from "./EmotionMeter";
import SpeakingSpeed from "./SpeakingSpeed";

export default function LiveAnalysisPanel({
  timeLeft,
  totalTime,
  recording,
  confidence,
  speakingSpeed,
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
        overflow-hidden
        select-none
        transform-gpu
      "
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📊</span>
          <div>
            <h2 className="text-sm font-extrabold text-white">
              Live Analysis
            </h2>
            <p className="text-cyan-100 text-[11px]">
              Real-time AI Analytics
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Sub-components Grid */}
      <div className="p-4 space-y-3.5">
        <TimerCard
          timeLeft={timeLeft}
          totalTime={totalTime}
        />

        <ConfidenceMeter
          value={confidence}
        />

        <EmotionMeter
          confidence={confidence}
        />

        <SpeakingSpeed
          speed={speakingSpeed}
        />

        {/* Live Session Status Banner */}
        <div className="rounded-2xl bg-black/40 border border-white/10 p-3.5 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Session Status
              </h3>
              <p className="text-[11px] text-gray-400">
                Microphone Activity
              </p>
            </div>

            <span
              className={`w-3 h-3 rounded-full transition-all ${
                recording
                  ? "bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50"
                  : "bg-amber-400 shadow-lg shadow-amber-500/30"
              }`}
            />
          </div>

          <div className="mt-2 pt-2 border-t border-white/5">
            {recording ? (
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span>🎤</span> Recording Audio...
              </p>
            ) : (
              <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>⏸</span> Waiting for Input...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}