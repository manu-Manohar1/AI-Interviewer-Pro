import React from "react";
import { FaFire } from "react-icons/fa";

export default function StreakCard({ streakDays = 5 }) {
  return (
    <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
      {/* Background Ambient Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-orange-500/20">
          <FaFire className="animate-bounce" />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Practice Streak
          </p>
          <h3 className="text-xl font-extrabold text-white mt-0.5">
            {streakDays} Days Active
          </h3>
        </div>
      </div>

      <div className="relative z-10 text-right">
        <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
          🔥 Keep it up!
        </span>
      </div>
    </div>
  );
}