import {
  FaClipboardCheck,
  FaChartLine,
  FaTrophy,
  FaFileAlt,
} from "react-icons/fa";

export default function StatsCards({ stats }) {
  const cards = [
    {
      title: "Total Interviews",
      value: stats.total_interviews,
      icon: <FaClipboardCheck />,
      gradient: "from-cyan-500 to-blue-600",
      accentColor: "text-cyan-400",
    },
    {
      title: "Average Score",
      value: `${stats.average_score}%`,
      icon: <FaChartLine />,
      gradient: "from-green-500 to-emerald-600",
      accentColor: "text-emerald-400",
    },
    {
      title: "Best Score",
      value: `${stats.best_score}%`,
      icon: <FaTrophy />,
      gradient: "from-violet-500 to-purple-600",
      accentColor: "text-purple-400",
    },
    {
      title: "Resumes",
      value: stats.resumes,
      icon: <FaFileAlt />,
      gradient: "from-orange-500 to-red-500",
      accentColor: "text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        // Calculate progress percentage safely
        const rawNum = Number(String(card.value).replace("%", ""));
        const progressWidth =
          card.title === "Resumes"
            ? "70%"
            : `${Math.min(isNaN(rawNum) ? 0 : rawNum, 100)}%`;

        return (
          <div
            key={index}
            className="group relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top Glowing Ambient Light */}
            <div
              className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-20 group-hover:opacity-40 rounded-full blur-2xl transition-opacity duration-300`}
            />

            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <h2 className={`text-3xl font-extrabold mt-2 ${card.accentColor}`}>
                  {card.value}
                </h2>
              </div>

              {/* Icon Container */}
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {card.icon}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 w-full h-2 rounded-full bg-white/10 overflow-hidden relative z-10">
              <div
                className={`h-full bg-gradient-to-r ${card.gradient} rounded-full transition-all duration-500`}
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}