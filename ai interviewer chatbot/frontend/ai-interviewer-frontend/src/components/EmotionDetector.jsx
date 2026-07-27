import React from "react";

const EMOTIONS_MAP = {
  happy: {
    emoji: "😊",
    name: "Happy",
    color: "text-emerald-400",
    gradient: "from-emerald-500 via-teal-400 to-cyan-400",
  },
  neutral: {
    emoji: "😐",
    name: "Neutral",
    color: "text-cyan-400",
    gradient: "from-cyan-500 via-blue-400 to-indigo-500",
  },
  nervous: {
    emoji: "😟",
    name: "Nervous",
    color: "text-amber-400",
    gradient: "from-amber-400 via-orange-400 to-yellow-500",
  },
  surprised: {
    emoji: "😮",
    name: "Surprised",
    color: "text-purple-400",
    gradient: "from-purple-500 via-pink-500 to-indigo-500",
  },
  tired: {
    emoji: "😴",
    name: "Tired",
    color: "text-rose-400",
    gradient: "from-rose-500 via-pink-500 to-red-500",
  },
};

export default function EmotionDetector({
  emotion = "neutral",
  confidence = 85,
}) {
  // Extract configuration or fallback to neutral
  const normalizedKey = (emotion || "neutral").toLowerCase();
  const current = EMOTIONS_MAP[normalizedKey] || EMOTIONS_MAP.neutral;
  const realScore = Math.min(100, Math.max(0, Math.round(Number(confidence) || 0)));

  return (
    <div
      className="
        bg-slate-900/60
        backdrop-blur-xl
        border border-white/10
        rounded-3xl
        shadow-xl
        hover:border-pink-500/40
        transition-all
        duration-300
        overflow-hidden
        select-none
        transform-gpu
      "
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              😊 Emotion Detection
            </h2>
            <p className="text-pink-100 text-[11px]">
              AI Facial Expression Analysis
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-black/20 border border-white/10 px-2.5 py-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white tracking-wider">
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-4">
        {/* Emotion Display */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl animate-pulse pointer-events-none" />
            <div className="relative text-5xl transform hover:scale-110 transition-transform">
              {current.emoji}
            </div>
          </div>

          <h3 className={`mt-2 text-xl font-extrabold tracking-wide ${current.color}`}>
            {current.name}
          </h3>

          <p className="mt-0.5 text-[11px] text-gray-400 text-center">
            AI continuously analyzes facial expressions.
          </p>
        </div>

        {/* Confidence Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5 font-semibold">
            <span className="text-gray-400">
              Detection Confidence
            </span>
            <span className="text-cyan-400 font-bold">
              {realScore}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${current.gradient} transition-all duration-500 ease-out`}
              style={{
                width: `${realScore}%`,
              }}
            />
          </div>
        </div>

        {/* Status Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
          <span className="text-gray-400 font-medium">
            AI Detector Status:
          </span>

          <span className={`font-bold ${current.color} flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-[11px]`}>
            Face Detected
          </span>
        </div>
      </div>
    </div>
  );
}