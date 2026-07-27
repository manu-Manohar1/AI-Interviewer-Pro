import {
  FaBrain,
  FaBullseye,
  FaLightbulb,
  FaCheckCircle,
} from "react-icons/fa";

export default function AIInsights() {
  const insights = [
    {
      icon: <FaBrain />,
      title: "Strength",
      value: "Strong Technical Knowledge",
      bgColor: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    },
    {
      icon: <FaBullseye />,
      title: "Weakness",
      value: "Behavioral Answers",
      bgColor: "bg-red-500/10 border-red-500/20 text-red-400",
    },
    {
      icon: <FaLightbulb />,
      title: "Recommendation",
      value: "Practice DSA & Mock Interviews",
      bgColor: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    },
    {
      icon: <FaCheckCircle />,
      title: "Interview Readiness",
      value: "88% Ready",
      bgColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    },
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
      <h2 className="text-xl font-bold text-white tracking-tight">
        AI Insights
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {insights.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-white/10 transition-all duration-200"
          >
            <div
              className={`w-11 h-11 rounded-xl border ${item.bgColor} flex items-center justify-center text-lg shrink-0`}
            >
              {item.icon}
            </div>

            <div>
              <h3 className="font-bold text-white text-sm">
                {item.title}
              </h3>
              <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="font-semibold text-gray-300">
            Overall Readiness
          </span>
          <span className="font-extrabold text-cyan-400">
            88%
          </span>
        </div>

        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: "88%" }}
          />
        </div>
      </div>
    </div>
  );
}