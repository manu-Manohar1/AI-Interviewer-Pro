import React, { useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import api from "../api/api";

export default function VoiceRecorder({ onTranscript }) {
  const [uploading, setUploading] = useState(false);
  const [transcript, setTranscript] = useState("");

  const uploadAudio = async (blobUrl) => {
    try {
      setUploading(true);

      const blob = await fetch(blobUrl).then((r) => r.blob());

      const formData = new FormData();
      formData.append("file", blob, "answer.wav");

      const res = await api.post("/transcribe/whisper", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setTranscript(res.data.text);

      if (onTranscript) {
        onTranscript(res.data.text);
      }
    } catch (err) {
      console.error(err);

      setTranscript("");

      if (err.response) {
        alert(err.response.data.detail || "Speech recognition failed.");
      } else {
        alert("Speech recognition failed.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <ReactMediaRecorder
      audio
      render={({
        status,
        startRecording,
        stopRecording,
        mediaBlobUrl,
      }) => (
        <div
          className="
            bg-slate-900/60
            backdrop-blur-xl
            border border-white/10
            rounded-3xl
            p-6
            shadow-xl
            hover:border-cyan-500/40
            transition-all
            duration-300
            select-none
            transform-gpu
          "
        >
          {/* Header & Status */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>🎤</span> Voice Recorder
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Record your audio response for Whisper AI analysis
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] font-bold tracking-wider">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === "recording"
                    ? "bg-rose-500 animate-pulse shadow-md shadow-rose-500/50"
                    : "bg-emerald-400"
                }`}
              />
              <span
                className={
                  status === "recording" ? "text-rose-400" : "text-emerald-400"
                }
              >
                {status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap gap-3 mb-5">
            <button
              type="button"
              onClick={startRecording}
              disabled={status === "recording"}
              className="
                flex-1
                flex items-center justify-center gap-2
                bg-emerald-500/10 hover:bg-emerald-500/20
                text-emerald-400
                border border-emerald-500/20
                px-5 py-2.5
                rounded-2xl
                text-xs font-bold
                transition-all active:scale-95
                disabled:opacity-40 disabled:pointer-events-none
              "
            >
              🎤 Start Recording
            </button>

            <button
              type="button"
              onClick={stopRecording}
              disabled={status !== "recording"}
              className="
                flex-1
                flex items-center justify-center gap-2
                bg-rose-500/10 hover:bg-rose-500/20
                text-rose-400
                border border-rose-500/20
                px-5 py-2.5
                rounded-2xl
                text-xs font-bold
                transition-all active:scale-95
                disabled:opacity-40 disabled:pointer-events-none
              "
            >
              ⏹ Stop Recording
            </button>
          </div>

          {/* Audio Preview Controls */}
          {mediaBlobUrl && (
            <div className="mb-5 p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Audio Preview
              </p>

              <audio
                controls
                src={mediaBlobUrl}
                className="w-full accent-cyan-400 h-10"
              />

              <button
                type="button"
                onClick={() => uploadAudio(mediaBlobUrl)}
                disabled={uploading}
                className="
                  w-full
                  flex items-center justify-center gap-2
                  bg-gradient-to-r from-cyan-500 to-blue-600
                  hover:from-cyan-400 hover:to-blue-500
                  text-white
                  px-6 py-2.5
                  rounded-2xl
                  text-xs font-bold
                  shadow-lg shadow-cyan-500/20
                  transition-all active:scale-95
                  disabled:opacity-50 disabled:pointer-events-none
                "
              >
                {uploading ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Uploading Audio...
                  </>
                ) : (
                  "⚡ Transcribe Voice"
                )}
              </button>
            </div>
          )}

          {/* Transcript Output Box */}
          {transcript && (
            <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
              <h3 className="font-bold text-xs text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📝</span> Generated Transcript
              </h3>

              <p className="text-gray-100 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                {transcript}
              </p>
            </div>
          )}
        </div>
      )}
    />
  );
}