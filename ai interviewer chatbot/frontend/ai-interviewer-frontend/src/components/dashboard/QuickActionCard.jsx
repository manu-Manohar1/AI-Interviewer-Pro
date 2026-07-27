import React from "react";
import { Link } from "react-router-dom";

export default function QuickActionCard({
  to,
  icon,
  title,
  description,
  color = "from-cyan-500 to-blue-600",
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-3xl bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between"
    >
      {/* Top Gradient Header Bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${color}`} />

      <div className="p-6">
        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${color}
          flex items-center justify-center text-white text-2xl
          shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mt-5 group-hover:text-cyan-400 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm mt-2 leading-relaxed">
          {description}
        </p>

        {/* Action Link */}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-cyan-400 font-semibold text-sm group-hover:underline">
            Open
          </span>
          <span className="text-xl text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}