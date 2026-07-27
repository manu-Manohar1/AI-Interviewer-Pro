import React, { useMemo } from "react";

export default function AICoach({
  confidence,
  eyeContact,
  speakingSpeed,
  recording = false,
}) {
  // Generate coaching feedback dynamically based purely on real-time data inputs
  const tips = useMemo(() => {
    const list = [];

    // Idle state feedback
    if (!recording) {
      list.push("🎤 Start recording to receive live AI feedback.");
      return list;
    }

    // Live real data evaluation
    if (typeof confidence === "number" && confidence < 70) {
      list.push("💪 Speak with more confidence.");
    }

    if (typeof eyeContact === "number" && eyeContact < 80) {
      list.push("👀 Maintain better eye contact with the camera.");
    }

    if (typeof speakingSpeed === "number") {
      if (speakingSpeed < 100 && speakingSpeed > 0) {
        list.push("⚡ Speak a little faster.");
      } else if (speakingSpeed > 160) {
        list.push("🗣 Slow down slightly.");
      }
    }

    // High performance feedback (only when real metrics meet thresholds during active recording)
    if (
      confidence >= 80 &&
      eyeContact >= 80 &&
      speakingSpeed >= 100 &&
      speakingSpeed <= 160
    ) {
      list.push("✅ Great pace and delivery! Keep explaining your reasoning.");
    }

    return list;
  }, [confidence, eyeContact, speakingSpeed, recording]);

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
        p-4
        select-none
        transform-gpu
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            🤖 AI Coach
          </h3>
          <p className="text-[11px] text-gray-400">
            Live Interview Guidance
          </p>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            recording
              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse"
              : "bg-white/5 text-gray-400 border-white/10"
          }`}
        >
          ● {recording ? "LIVE" : "IDLE"}
        </span>
      </div>

      {/* Real-time Advice Panel */}
      <div className="rounded-2xl bg-black/40 border border-white/5 p-3.5 min-h-[100px] flex items-center">
        <div className="space-y-2 w-full">
          {tips.map((item, index) => (
            <div
              key={index}
              className="text-xs font-medium text-cyan-300 flex items-start gap-2 leading-relaxed"
            >
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Audio / Video Telemetry Stats */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-[11px] font-semibold">
        <span className="text-gray-400">
          Confidence:{" "}
          <span className="text-cyan-400">
            {typeof confidence === "number" ? `${confidence}%` : "--"}
          </span>
        </span>

        <span className="text-gray-400">
          Eye Contact:{" "}
          <span className="text-cyan-400">
            {typeof eyeContact === "number" ? `${eyeContact}%` : "--"}
          </span>
        </span>

        <span className="text-gray-400">
          Speed:{" "}
          <span className="text-cyan-400">
            {typeof speakingSpeed === "number" ? `${speakingSpeed} WPM` : "--"}
          </span>
        </span>
      </div>
    </div>
  );
}