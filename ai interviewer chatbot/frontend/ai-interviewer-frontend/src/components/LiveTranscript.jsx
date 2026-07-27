import { useEffect, useRef } from "react";

export default function LiveTranscript({
  transcript,
  recording,
}) {
  const transcriptRef = useRef(null);

  // Smooth scroll to bottom on streaming transcript updates
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [transcript]);

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              📝 Live Transcript
            </h2>
            <p className="text-cyan-100 text-[11px]">
              Real-time Whisper AI Speech Recognition
            </p>
          </div>

          <div
            className={`
              px-3 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md transition-all
              ${
                recording
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              }
            `}
          >
            {recording ? "🎤 Listening" : "✅ Ready"}
          </div>
        </div>
      </div>

      {/* Transcript Area */}
      <div className="p-4">
        <div
          ref={transcriptRef}
          className="
            rounded-2xl
            bg-black/40
            border border-white/10
            min-h-[110px]
            max-h-[140px]
            overflow-y-auto
            p-4
            transition-all
            duration-300
            custom-scrollbar
          "
        >
          {transcript ? (
            <div className="flex items-baseline flex-wrap gap-1">
              <p className="text-gray-100 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                {transcript}
              </p>

              {recording && (
                <span className="inline-block w-1.5 h-3.5 bg-cyan-400 animate-pulse rounded-full ml-1" />
              )}
            </div>
          ) : (
            <div className="h-[110px] flex flex-col items-center justify-center text-center">
              <div className="relative">
                <div className="text-3xl">🎙️</div>

                {recording && (
                  <span className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>

              <p className="mt-2 text-cyan-400 font-bold text-xs">
                {recording
                  ? "Listening to your voice..."
                  : "Waiting for your answer..."}
              </p>

              <p className="mt-0.5 text-gray-400 text-[11px]">
                {recording
                  ? "Speak naturally into your microphone..."
                  : "Press 'Start Recording' to begin"}
              </p>

              {recording && (
                <div className="flex gap-1.5 mt-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}