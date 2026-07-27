import React from "react";

export default function ConfidenceMeter({ value = 0 }) {
  // Clamp value strictly between 0 and 100 for accurate rendering
  const realScore = Math.min(100, Math.max(0, Math.round(Number(value) || 0)));

  // Dynamic visual status thresholds based on live real score
  let gradient = "from-red-500 via-rose-500 to-pink-500";
  let label = "Needs Work";
  let emoji = "😟";

  if (realScore >= 85) {
    gradient = "from-emerald-500 via-teal-400 to-cyan-400";
    label = "Excellent";
    emoji = "🔥";
  } else if (realScore >= 70) {
    gradient = "from-cyan-500 via-blue-500 to-indigo-500";
    label = "Good";
    emoji = "😊";
  } else if (realScore >= 50) {
    gradient = "from-amber-400 via-orange-400 to-yellow-500";
    label = "Average";
    emoji = "🙂";
  }

  return (
    <div
      className="
        bg-slate-900/60
        backdrop-blur-xl
        border border-white/10
        rounded-3xl
        p-4
        shadow-xl
        hover:border-cyan-500/40
        transition-all
        duration-300
        select-none
        transform-gpu
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            ⚡ Live Confidence
          </h3>
          <p className="text-[11px] text-gray-400">
            Real-time Audio & Emotion Score
          </p>
        </div>

        <div className="text-right">
          <div className="text-xl font-extrabold text-cyan-400 tracking-tight">
            {realScore}%
          </div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-cyan-500/80">
            Real Data
          </div>
        </div>
      </div>

      {/* Real-time Smooth Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-black/40 border border-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500 ease-out`}
          style={{
            width: `${realScore}%`,
          }}
        />
      </div>

      {/* Metric Status Footer */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="text-gray-400 font-medium">
          AI Status:
        </span>

        <span className="font-bold text-white flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-[11px]">
          <span>{emoji}</span>
          <span className="text-cyan-300">{label}</span>
        </span>
      </div>
    </div>
  );
}