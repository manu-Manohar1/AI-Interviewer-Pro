'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
  fetch('http://127.0.0.1:8000/interview/history')
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => setHistory([]));

    fetch('http://127.0.0.1:8000/interview/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const downloadReport = async (sessionId) => {
    const res = await fetch(`/interview/report/${sessionId}`, { credentials: 'include' });
    if (!res.ok) {
      window.alert('Report download failed.');
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-report-${sessionId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const chartData = {
    labels: stats ? stats.progress.map((p) => p.date.split('T')[0]) : [],
    datasets: [
      {
        label: 'Overall Score',
        data: stats ? stats.progress.map((p) => p.overall) : [],
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      },
    ],
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Interview Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-slate-900 rounded">
            <div className="text-sm text-slate-400">Best Score</div>
            <div className="text-2xl">{stats.best_score}</div>
          </div>
          <div className="p-4 bg-slate-900 rounded">
            <div className="text-sm text-slate-400">Average Score</div>
            <div className="text-2xl">{stats.average_score}</div>
          </div>
          <div className="p-4 bg-slate-900 rounded">
            <div className="text-sm text-slate-400">Sessions</div>
            <div className="text-2xl">{history.length}</div>
          </div>
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">Progress</h2>
        <div className="w-full max-w-3xl">
          <Line data={chartData} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">Weak Topics</h2>
        <ul>
          {(stats?.weak_topics || []).slice(0,5).map((t) => (
            <li key={t.type} className="mb-2">{t.type}: {t.avg_score}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">Strong Skills</h2>
        <ul>
          {(stats?.strong_skills || []).slice(0,8).map((s) => (
            <li key={s.skill} className="mb-2">{s.skill}: {s.avg_score}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-3">Interview History</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Date</th>
              <th>Role</th>
              <th>Overall</th>
              <th>Report</th>
            </tr>
          </thead>
          <tbody>
            {history.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="py-2">{s.date?.split('T')[0]}</td>
                <td>{s.role}</td>
                <td>{s.overall_score}</td>
                <td>
                  <button className="rounded bg-indigo-600 px-3 py-1 text-sm text-white" onClick={() => downloadReport(s.id)}>
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
