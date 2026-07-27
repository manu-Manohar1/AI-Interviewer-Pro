import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const data = [
  { skill: "Technical", score: 90 },
  { skill: "Communication", score: 82 },
  { skill: "Confidence", score: 85 },
  { skill: "Problem Solving", score: 88 },
  { skill: "Grammar", score: 80 },
];

export default function SkillRadar() {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
      <h2 className="text-xl font-bold text-white tracking-tight">
        Skill Analysis
      </h2>

      <div className="grid lg:grid-cols-2 gap-6 items-center">
        {/* Radar Chart Visual */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="70%">
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <PolarRadiusAxis domain={[0, 100]} stroke="#475569" />
              <Radar
                dataKey="score"
                stroke="#06b6d4"
                fill="#0891b2"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Progress Indicators */}
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.skill}>
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium text-gray-300">
                  {item.skill}
                </span>
                <span className="font-bold text-cyan-400">
                  {item.score}%
                </span>
              </div>

              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}