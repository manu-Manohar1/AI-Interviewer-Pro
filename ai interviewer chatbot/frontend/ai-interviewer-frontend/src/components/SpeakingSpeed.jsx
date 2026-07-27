import React from "react";

export default function SpeakingSpeed({ speed = 0 }) {
  // Real numeric speed value
  const realSpeed = Math.max(0, Math.round(Number(speed) || 0));

  // Determine status and styling directly without state thrashing
  let status = "Waiting";
  let color = "text-gray-400";
  let gradient = "from-slate-600 to-slate-400";
  let emoji = "💤";

  if (realSpeed > 0 && realSpeed < 100) {
    status = "Too Slow";
    color = "text-amber-400";
    gradient = "from-amber-400 via-orange-400 to-yellow-500";
    emoji = "🐢";
  } else if (realSpeed >= 100 && realSpeed <= 160) {
    status = "Perfect Pace";
    color = "text-emerald-400";
    gradient = "from-emerald-500 via-teal-400 to-cyan-400";
    emoji = "✅";
  } else if (realSpeed > 160) {
    status = "Too Fast";
    color = "text-rose-400";
    gradient = "from-rose-500 via-pink-500 to-red-500";
    emoji = "⚡";
  }

  const progress = Math.min((realSpeed / 200) * 100, 100);

  const recommendation =
    realSpeed === 0
      ? "Waiting for live speech..."
      : realSpeed < 100
      ? "Speak slightly faster."
      : realSpeed <= 160
      ? "Excellent pacing and clarity."
      : "Slow down slightly.";

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
            🗣 Speaking Speed
          </h3>
          <p className="text-[11px] text-gray-400">
            Real-time Cadence Analysis
          </p>
        </div>

        <div className="text-right">
          <div className="text-xl font-extrabold text-cyan-400 tracking-tight">
            {realSpeed}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-cyan-500/80">
            WPM
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500 ease-out`}
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* Footer Details */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="text-gray-400 font-medium">
          Words / Min:
        </span>

        <span className={`font-bold ${color} flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-[11px]`}>
          <span>{emoji}</span>
          <span>{status}</span>
        </span>
      </div>

      {/* Recommendation Box */}
      <div className="mt-3 rounded-2xl bg-black/40 border border-white/5 px-3 py-2">
        <p className="text-[11px] font-medium text-cyan-300">
          💡 {recommendation}
        </p>
      </div>
    </div>
  );
}