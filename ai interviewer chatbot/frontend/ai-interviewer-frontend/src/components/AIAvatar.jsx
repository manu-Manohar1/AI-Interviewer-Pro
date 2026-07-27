import React, { useEffect, useMemo, useState } from "react";
import "../styles/aiAvatar.css";

export default function AIAvatar({
  speaking,
  recording,
  interviewState,
}) {
  const [dots, setDots] = useState(".");
  const [thinkingText, setThinkingText] = useState("Analyzing response...");
  const [imageError, setImageError] = useState(false);

  // Dots Animation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Evaluating Text Loop
  useEffect(() => {
    if (interviewState !== "evaluating") return;

    const messages = [
      "Analyzing response...",
      "Checking confidence...",
      "Evaluating communication...",
      "Generating feedback...",
      "Almost done...",
    ];

    let index = 0;
    setThinkingText(messages[0]);

    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setThinkingText(messages[index]);
    }, 1800);

    return () => clearInterval(interval);
  }, [interviewState]);

  // Status Configuration Mapper
  const statusConfig = useMemo(() => {
    switch (interviewState) {
      case "speaking":
        return {
          emoji: "🗣️",
          title: "Speaking",
          ring: "ring-blue-400",
          glow: "bg-blue-500/30",
          border: "border-blue-400/70",
          badge: "bg-blue-600",
          gradient: "from-blue-500 via-cyan-500 to-blue-700",
          speed: "2s",
        };

      case "listening":
        return {
          emoji: "🎤",
          title: "Listening",
          ring: "ring-green-400",
          glow: "bg-green-500/30",
          border: "border-green-400/70",
          badge: "bg-green-600",
          gradient: "from-green-500 via-emerald-500 to-green-700",
          speed: "4s",
        };

      case "transcribing":
        return {
          emoji: "✍️",
          title: "Transcribing",
          ring: "ring-yellow-400",
          glow: "bg-yellow-500/30",
          border: "border-yellow-400/70",
          badge: "bg-yellow-600",
          gradient: "from-yellow-500 via-orange-400 to-amber-600",
          speed: "6s",
        };

      case "evaluating":
        return {
          emoji: "🧠",
          title: "Thinking",
          ring: "ring-purple-400",
          glow: "bg-purple-500/30",
          border: "border-purple-400/70",
          badge: "bg-purple-600",
          gradient: "from-purple-500 via-fuchsia-500 to-indigo-700",
          speed: "5s",
        };

      case "completed":
        return {
          emoji: "✅",
          title: "Completed",
          ring: "ring-lime-400",
          glow: "bg-lime-500/30",
          border: "border-lime-400/70",
          badge: "bg-lime-600",
          gradient: "from-green-500 via-lime-500 to-green-700",
          speed: "8s",
        };

      default:
        return {
          emoji: "🤖",
          title: "Ready",
          ring: "ring-cyan-400",
          glow: "bg-cyan-500/20",
          border: "border-cyan-400/70",
          badge: "bg-cyan-600",
          gradient: "from-cyan-500 via-blue-500 to-indigo-600",
          speed: "8s",
        };
    }
  }, [interviewState]);

  return (
    <div className="flex flex-col items-center select-none py-2">
      {/* Larger Outer Avatar Container (w-48 h-48) */}
      <div className="relative w-48 h-48 flex items-center justify-center transform-gpu">
        {/* Expanded Ambient Glow */}
        <div
          className={`
            absolute
            w-48
            h-48
            rounded-full
            blur-3xl
            animate-pulse
            pointer-events-none
            ${statusConfig.glow}
          `}
        />

        {/* Orbit Ring */}
        <div
          className={`
            absolute
            inset-0
            rounded-full
            border-2
            ${statusConfig.border}
            animate-spin
            will-change-transform
          `}
          style={{
            animationDuration: statusConfig.speed,
          }}
        />

        {/* Expanded Speaking Ripples */}
        {interviewState === "speaking" && (
          <>
            <div className="absolute w-36 h-36 rounded-full border border-cyan-400/50 animate-ping" />
            <div
              className="absolute w-44 h-44 rounded-full border border-cyan-300/30 animate-ping"
              style={{ animationDelay: "500ms" }}
            />
          </>
        )}

        {/* Orbit Dots */}
        <div
          className="absolute inset-0 animate-spin will-change-transform pointer-events-none"
          style={{
            animationDuration: statusConfig.speed,
          }}
        >
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-300 shadow-sm" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-300 shadow-sm" />
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-purple-300 shadow-sm" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-green-300 shadow-sm" />
        </div>

        {/* LIVE Badge */}
        <div
          className={`
            absolute
            top-0
            right-0
            px-3
            py-1
            rounded-full
            text-[10px]
            font-bold
            text-white
            shadow-lg
            z-20
            ${statusConfig.badge}
            live-badge
          `}
        >
          ● LIVE
        </div>

        {/* Main Avatar Sphere (Enlarged to w-32 h-32) */}
        <div
          className={`
            relative
            w-32
            h-32
            rounded-full
            bg-gradient-to-br
            ${statusConfig.gradient}
            flex
            items-center
            justify-center
            ring-4
            ${statusConfig.ring}
            shadow-2xl
            animate-breathe
            transform-gpu
            ${interviewState === "speaking" ? "animate-aiGlow" : ""}
          `}
        >
          {/* Glass Reflection */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="absolute -left-16 top-0 w-14 h-full bg-white/20 rotate-12 animate-glass" />
          </div>

          {/* Scanner Beam */}
          <div
            className={`
              absolute
              left-0
              w-full
              h-1.5
              rounded-full
              pointer-events-none
              ${statusConfig.glow}
              animate-scan
            `}
          />

          {/* Robot Avatar Image / Fallback (Increased to w-28 h-28) */}
          {!imageError ? (
            <img
              src="/images/robot.png"
              alt="AI Interviewer"
              draggable={false}
              onError={() => setImageError(true)}
              className="w-28 h-28 object-contain relative z-10 animate-float drop-shadow-xl"
            />
          ) : (
            <span className="text-5xl relative z-10 animate-float">🤖</span>
          )}

          {/* Online Status Dot */}
          <div className="absolute bottom-1 right-1 z-20">
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>
        </div>
      </div>

      {/* AI Title */}
      <h2 className="mt-4 text-lg font-bold text-white tracking-wide">
        AI Interviewer
      </h2>

      {/* Subtitle Status */}
      <p
        className={`
          mt-0.5
          text-xs
          font-semibold
          transition-colors
          duration-300
          ${
            interviewState === "speaking"
              ? "text-blue-300"
              : interviewState === "listening"
              ? "text-green-300"
              : interviewState === "transcribing"
              ? "text-yellow-300"
              : interviewState === "evaluating"
              ? "text-purple-300 thinking-text"
              : interviewState === "completed"
              ? "text-lime-300"
              : "text-cyan-300"
          }
        `}
      >
        {statusConfig.emoji}{" "}
        {interviewState === "evaluating" ? thinkingText : statusConfig.title}
        {interviewState === "evaluating" && dots}
      </p>

      {/* Listening Status Badge */}
      {(recording || interviewState === "listening") && (
        <div className="mt-2.5 flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-emerald-300 text-xs font-medium">
            Listening...
          </span>
        </div>
      )}

      {/* Speaking Status Badge */}
      {speaking && (
        <div className="mt-2.5 flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="text-blue-300 text-xs font-medium">
            AI is Speaking...
          </span>
        </div>
      )}
    </div>
  );
}