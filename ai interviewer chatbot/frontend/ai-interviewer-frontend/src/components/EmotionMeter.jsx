import React from "react";

export default function EmotionMeter({ confidence = 0 }) {
  // Bound score strictly between 0 and 100
  const realScore = Math.min(100, Math.max(0, Math.round(Number(confidence) || 0)));

  // Derive display values directly without useEffect state thrashing
  let emoji = "😟";
  let status = "Needs Improvement";
  let color = "text-rose-400";
  let glow = "shadow-rose-500/20";
  let gradient = "from-rose-500 via-pink-500 to-red-500";

  if (realScore >= 85) {
    emoji = "😎";
    status = "Highly Confident";
    color = "text-emerald-400";
    glow = "shadow-emerald-500/20";
    gradient = "from-emerald-500 via-teal-400 to-cyan-400";
  } else if (realScore >= 70) {
    emoji = "😊";
    status = "Calm & Focused";
    color = "text-cyan-400";
    glow = "shadow-cyan-500/20";
    gradient = "from-cyan-500 via-blue-500 to-indigo-500";
  } else if (realScore >= 50) {
    emoji = "🙂";
    status = "Average";
    color = "text-amber-400";
    glow = "shadow-amber-500/20";
    gradient = "from-amber-400 via-orange-400 to-yellow-500";
  }

  return (
    <div
      className={`
        bg-slate-900/60
        backdrop-blur-xl
        border border-white/10
        rounded-3xl
        shadow-xl
        ${glow}
        p-4
        hover:border-cyan-500/40
        transition-all
        duration-300
        select-none
        transform-gpu
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            😊 Facial Expression
          </h3>
          <p className="text-[11px] text-gray-400">
            Real-time Emotion Metrics
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md animate-pulse pointer-events-none" />
          <div className="relative text-3xl transform hover:scale-110 transition-transform">
            {emoji}
          </div>
        </div>
      </div>

      {/* Real-time Progress Bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5 font-semibold">
          <span className="text-gray-400">
            Detection Score
          </span>
          <span className="text-cyan-400 font-bold">
            {realScore}%
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500 ease-out`}
            style={{
              width: `${realScore}%`,
            }}
          />
        </div>
      </div>

      {/* Footer & Live Badge */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-xs">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
            Live
          </span>
        </div>

        <span className={`font-bold ${color} text-[11px]`}>
          {status}
        </span>
      </div>
    </div>
  );
}