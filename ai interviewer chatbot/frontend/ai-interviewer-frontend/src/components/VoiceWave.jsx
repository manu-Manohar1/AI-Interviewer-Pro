import React, { useEffect, useState } from "react";

export default function VoiceWave({ state, analyser }) {
  const BAR_COUNT = 17;

  const [bars, setBars] = useState(Array(BAR_COUNT).fill(12));

  useEffect(() => {
    let animationId;

    const animate = () => {
      if (state === "listening" && analyser?.current) {
        try {
          const analyserNode = analyser.current;
          const dataArray = new Uint8Array(analyserNode.frequencyBinCount || 64);

          analyserNode.getByteFrequencyData(dataArray);

          const newBars = Array.from({ length: BAR_COUNT }, (_, i) => {
            const index = Math.floor((i / BAR_COUNT) * dataArray.length);
            const value = dataArray[index] || 0;
            return Math.max(12, value / 2.5);
          });

          setBars(newBars);
        } catch (err) {
          // Fallback if audio node fails
          setBars(Array(BAR_COUNT).fill(12));
        }
      } else if (state === "speaking") {
        const center = (BAR_COUNT - 1) / 2;

        const newBars = Array.from({ length: BAR_COUNT }, (_, i) => {
          const distance = Math.abs(i - center);
          const peak = 70 - distance * 7 + Math.random() * 12;
          return Math.max(14, peak);
        });

        setBars(newBars);
      } else {
        setBars(Array(BAR_COUNT).fill(12));
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [state, analyser]);

  const statusText =
    state === "speaking"
      ? "🤖 AI Speaking..."
      : state === "listening"
      ? "🎤 Listening..."
      : "💤 Waiting...";

  const color =
    state === "speaking"
      ? "from-cyan-400 via-blue-400 to-purple-500"
      : state === "listening"
      ? "from-emerald-400 via-teal-400 to-cyan-400"
      : "from-gray-600 to-slate-500";

  return (
    <div className="w-full select-none transform-gpu">
      <div
        className="
          h-28
          rounded-2xl
          border border-white/10
          backdrop-blur-xl
          bg-black/40
          flex
          items-end
          justify-center
          gap-1.5
          px-4
          py-3
          overflow-hidden
          transition-all
          duration-300
          shadow-inner
        "
      >
        {bars.map((height, index) => (
          <div
            key={index}
            className={`
              w-2
              rounded-full
              bg-gradient-to-t
              ${color}
              transition-all
              duration-75
              ease-out
              ${
                state === "speaking"
                  ? "shadow-[0_0_12px_rgba(34,211,238,0.7)]"
                  : state === "listening"
                  ? "shadow-[0_0_12px_rgba(52,211,153,0.7)]"
                  : ""
              }
            `}
            style={{
              height: `${height}px`,
            }}
          />
        ))}
      </div>

      <p className="mt-2.5 text-center text-xs font-bold tracking-wide text-cyan-300">
        {statusText}
      </p>
    </div>
  );
}