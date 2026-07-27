import React from "react";

export default function TimerCard({
  timeLeft = 0,
  totalTime = 120,
}) {
  const progress = Math.max(
    0,
    Math.min((timeLeft / totalTime) * 100, 100)
  );

  const barColor =
    timeLeft > totalTime * 0.5
      ? "from-emerald-400 to-teal-500"
      : timeLeft > totalTime * 0.2
      ? "from-amber-400 to-orange-400"
      : "from-rose-500 to-red-600";

  const statusColor =
    timeLeft > totalTime * 0.2
      ? "bg-emerald-400"
      : "bg-rose-500 animate-pulse";

  const statusTextColor =
    timeLeft > totalTime * 0.2
      ? "text-emerald-400"
      : "text-rose-400 font-bold";

  const statusText =
    timeLeft > totalTime * 0.2
      ? "Active"
      : "Hurry!";

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

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
            ⏱ Timer
          </h3>
          <p className="text-[11px] text-gray-400">
            Question Limit
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
          <span className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className={`text-[10px] uppercase tracking-wider ${statusTextColor}`}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Clock Display */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 font-medium">
          Time Remaining
        </span>
        <span className="text-2xl font-black tracking-tight text-white tabular-nums">
          {minutes}:{seconds}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-2.5 text-[11px] font-semibold">
        <span className="text-cyan-400">
          {progress >= 90
            ? "In Progress"
            : progress >= 30
            ? "Halfway"
            : "Time Ending"}
        </span>

        <span className="text-gray-400">
          {Math.round(progress)}% Left
        </span>
      </div>
    </div>
  );
}