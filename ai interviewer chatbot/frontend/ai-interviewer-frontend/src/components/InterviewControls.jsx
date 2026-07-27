import React, { useState } from "react";

export default function InterviewControls({
  recording,
  onStart,
  onStop,
  onNext,
  onEnd,
}) {
  const [isPaused, setIsPaused] = useState(false);

  const handleStart = () => {
    setIsPaused(false);
    if (onStart) onStart();
  };

  const handlePauseToggle = () => {
    if (recording) {
      setIsPaused(true);
      if (onStop) onStop();
    } else {
      setIsPaused(false);
      if (onStart) onStart();
    }
  };

  const handleNext = () => {
    setIsPaused(false);
    if (onNext) {
      onNext();
    } else if (onStop) {
      onStop();
    }
  };

  const handleEnd = () => {
    setIsPaused(false);
    if (onEnd) {
      onEnd();
    } else if (onStop) {
      onStop();
    }
  };

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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
            🎮 Interview Controls
          </h2>
          <p className="text-[11px] text-gray-400">
            Session Management
          </p>
        </div>

        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
            recording
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse"
              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
          }`}
        >
          {recording ? "● Recording" : "● Live"}
        </span>
      </div>

      {/* Control Buttons Grid */}
      <div className="grid grid-cols-2 gap-3 text-white">
        {/* Start Button */}
        <button
          type="button"
          onClick={handleStart}
          disabled={recording}
          className="
            py-2.5 px-4
            rounded-2xl
            bg-emerald-500/10 hover:bg-emerald-500/20
            text-emerald-400
            border border-emerald-500/20
            font-bold
            text-xs
            transition-all
            active:scale-95
            disabled:opacity-40
            disabled:pointer-events-none
            flex items-center justify-center gap-1.5
          "
        >
          ▶ Start
        </button>

        {/* Pause / Resume Button */}
        <button
          type="button"
          onClick={handlePauseToggle}
          className="
            py-2.5 px-4
            rounded-2xl
            bg-amber-500/10 hover:bg-amber-500/20
            text-amber-300
            border border-amber-500/20
            font-bold
            text-xs
            transition-all
            active:scale-95
            flex items-center justify-center gap-1.5
          "
        >
          {isPaused ? "▶ Resume" : "⏸ Pause"}
        </button>

        {/* Next Question Button */}
        <button
          type="button"
          onClick={handleNext}
          className="
            py-2.5 px-4
            rounded-2xl
            bg-cyan-500/10 hover:bg-cyan-500/20
            text-cyan-300
            border border-cyan-500/20
            font-bold
            text-xs
            transition-all
            active:scale-95
            flex items-center justify-center gap-1.5
          "
        >
          ⏭ Next
        </button>

        {/* End Interview Button */}
        <button
          type="button"
          onClick={handleEnd}
          className="
            py-2.5 px-4
            rounded-2xl
            bg-rose-500/10 hover:bg-rose-500/20
            text-rose-400
            border border-rose-500/20
            font-bold
            text-xs
            transition-all
            active:scale-95
            flex items-center justify-center gap-1.5
          "
        >
          ⏹ End
        </button>
      </div>
    </div>
  );
}