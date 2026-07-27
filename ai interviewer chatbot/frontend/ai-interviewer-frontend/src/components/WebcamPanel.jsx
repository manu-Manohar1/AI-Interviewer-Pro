import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import EyeContactDetector from "./EyeContactDetector";

export default function WebcamPanel({ onEyeContactChange, currentEmotion = "😐 Neutral" }) {
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const webcamRef = useRef(null);

  const handleToggleCamera = () => {
    if (cameraOn) {
      setCameraOn(false);
      setCameraReady(false);
    } else {
      setCameraOn(true);
      setCameraError(false);
    }
  };

  return (
    <div
      className="
        bg-slate-900/60
        backdrop-blur-xl
        border border-white/10
        rounded-3xl
        p-5
        text-white
        shadow-xl
        hover:border-cyan-500/40
        transition-all
        duration-300
        select-none
        transform-gpu
        space-y-4
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
            📷 Live AI Vision
          </h2>
          <p className="text-[11px] text-gray-400">
            Facial Analysis & Tracking Feed
          </p>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            cameraOn && cameraReady
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}
        >
          {cameraOn && cameraReady ? "● ACTIVE" : "● OFF"}
        </span>
      </div>

      {/* Camera Viewfinder Box */}
      <div className="relative overflow-hidden rounded-2xl bg-black border border-white/10 h-56 flex items-center justify-center">
        {!cameraOn ? (
          <div className="text-center">
            <div className="text-3xl mb-1 text-gray-500">📷</div>
            <p className="text-gray-400 text-xs font-semibold">Camera is Off</p>
          </div>
        ) : (
          <>
            {!cameraReady && !cameraError && (
              <div className="absolute z-10 flex flex-col items-center justify-center space-y-2">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-cyan-300 font-medium">Loading Camera Stream...</p>
              </div>
            )}

            {cameraError && (
              <div className="absolute z-10 text-center px-4">
                <p className="text-rose-400 text-xs font-bold">
                  ⚠️ Camera Access Denied
                </p>
                <p className="text-gray-400 text-[10px] mt-1">
                  Please allow camera permissions in your browser.
                </p>
              </div>
            )}

            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              screenshotFormat="image/jpeg"
              className={`w-full h-56 object-cover rounded-2xl ${
                cameraReady ? "block" : "hidden"
              }`}
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user",
              }}
              onUserMedia={() => {
                setCameraReady(true);
                setCameraError(false);
              }}
              onUserMediaError={() => {
                setCameraError(true);
                setCameraReady(false);
              }}
            />

            {/* Subtle DSLR Grid Lines Overlay when Active */}
            {cameraReady && (
              <div className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:33.3%_33.3%]" />
            )}
          </>
        )}
      </div>

      {/* Emotion Telemetry Box */}
      <div className="bg-black/40 border border-white/5 rounded-2xl p-3 text-center space-y-0.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Detected Expression
        </p>
        <p className="text-lg font-extrabold text-cyan-300 tracking-wide">
          {currentEmotion}
        </p>
      </div>

      {/* Camera Toggle Button */}
      <button
        type="button"
        onClick={handleToggleCamera}
        className={`
          w-full py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 border
          ${
            cameraOn
              ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20"
              : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-transparent shadow-lg shadow-cyan-500/20"
          }
        `}
      >
        {cameraOn ? "📷 Stop Camera" : "▶️ Start Camera"}
      </button>

      {/* Embedded Eye Contact Detector Sub-Component */}
      {cameraOn && (
        <div className="pt-2">
          <EyeContactDetector
            webcamRef={webcamRef}
            onEyeContactChange={onEyeContactChange}
          />
        </div>
      )}
    </div>
  );
}