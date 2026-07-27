import {
  FaBriefcase,
  FaChartLine,
  FaCheckCircle,
  FaArrowUp,
} from "react-icons/fa";

export default function RecentInterview() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white shadow-2xl p-8">
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Section */}
        <div>
          <span className="uppercase tracking-widest text-cyan-400 text-xs font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Latest Interview
          </span>

          <h1 className="text-3xl font-extrabold mt-4 text-white">
            AI / ML Engineer
          </h1>

          <p className="text-gray-400 mt-2 text-sm leading-relaxed">
            Great progress! Your last interview performance improved compared
            to previous attempts.
          </p>

          <div className="flex gap-4 mt-6 flex-wrap">
            <div className="bg-black/40 border border-white/5 rounded-2xl px-5 py-3">
              <p className="text-xs font-semibold text-gray-400">
                Overall Score
              </p>
              <h3 className="text-2xl font-black text-cyan-400 mt-1">
                88%
              </h3>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-2xl px-5 py-3">
              <p className="text-xs font-semibold text-gray-400">
                Confidence
              </p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">
                High
              </h3>
            </div>
          </div>
        </div>

        {/* Right Metric Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
            <FaBriefcase className="text-2xl text-cyan-400 mb-2" />
            <p className="text-gray-400 text-xs font-medium">
              Role
            </p>
            <h3 className="font-bold text-white text-sm mt-0.5">
              AI Engineer
            </h3>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
            <FaChartLine className="text-2xl text-emerald-400 mb-2" />
            <p className="text-gray-400 text-xs font-medium">
              Improvement
            </p>
            <h3 className="font-bold text-white text-sm mt-0.5">
              +12%
            </h3>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
            <FaCheckCircle className="text-2xl text-amber-400 mb-2" />
            <p className="text-gray-400 text-xs font-medium">
              Readiness
            </p>
            <h3 className="font-bold text-white text-sm mt-0.5">
              Interview Ready
            </h3>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
            <FaArrowUp className="text-2xl text-purple-400 mb-2" />
            <p className="text-gray-400 text-xs font-medium">
              Recommendation
            </p>
            <h3 className="font-bold text-white text-sm mt-0.5">
              Practice DSA
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}