import React, { useState } from "react";
import Webcam from "react-webcam";
import { FaVideo, FaVideoSlash } from "react-icons/fa";

export default function LiveCamera({ webcamRef }) {
  const [cameraError, setCameraError] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

  const toggleCamera = () => {
    setCameraOn((prev) => !prev);
    setCameraError(false);
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
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
            📷 Studio HD Camera
          </h2>
          <p className="text-[11px] text-gray-400">
            Professional AI Vision Preview
          </p>
        </div>

        <button
          type="button"
          onClick={toggleCamera}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
            cameraOn
              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
          }`}
        >
          {cameraOn ? (
            <>
              <FaVideoSlash className="text-[10px]" /> Stop
            </>
          ) : (
            <>
              <FaVideo className="text-[10px]" /> Start
            </>
          )}
        </button>
      </div>

      {/* Professional Camera Viewfinder View */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black h-60 flex items-center justify-center group">
        {cameraOn ? (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: "user",
              }}
              onUserMedia={() => setCameraError(false)}
              onUserMediaError={(err) => {
                console.error("Camera access error:", err);
                setCameraError(true);
              }}
            />

            {/* Viewfinder Rule-of-Thirds Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:33.3%_33.3%]" />

            {/* Corner Focus Brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none" />

            {/* Center Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="w-4 h-4 border border-cyan-400 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-cyan-400 rounded-full" />
              </div>
            </div>

            {/* HUD Top Bar */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>REC</span>
              </div>

              <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300">
                <span>1080P</span>
                <span className="text-gray-500">•</span>
                <span>60 FPS</span>
              </div>
            </div>

            {/* HUD Bottom Bar */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none text-[9px] font-mono text-gray-300 px-1">
              <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/5">
                ISO 400
              </span>
              <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/5 text-emerald-400">
                AI Tracking Active
              </span>
            </div>
          </>
        ) : (
          /* Off State */
          <div className="text-center space-y-2 p-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-gray-500 text-xl">
              <FaVideoSlash />
            </div>
            <p className="text-gray-400 text-xs font-semibold">
              Camera Feed Stopped
            </p>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="flex justify-between items-center mt-3 pt-1 text-xs font-semibold">
        <span
          className={`flex items-center gap-1.5 text-[11px] ${
            cameraError
              ? "text-rose-400"
              : cameraOn
              ? "text-emerald-400"
              : "text-amber-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              cameraError
                ? "bg-rose-500"
                : cameraOn
                ? "bg-emerald-400 animate-pulse"
                : "bg-amber-400"
            }`}
          />
          {cameraError
            ? "Permission Denied"
            : cameraOn
            ? "1080p HD Feed Connected"
            : "Camera Off"}
        </span>

        <button
          type="button"
          onClick={toggleCamera}
          className="text-[11px] text-cyan-400 hover:underline font-bold transition-all"
        >
          {cameraOn ? "Disable Preview" : "Enable Preview"}
        </button>
      </div>
    </div>
  );
}