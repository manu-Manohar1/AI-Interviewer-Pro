import { useEffect, useState } from "react";
import { getUserSessions } from "../../services/interviewServices";
import api from "../../api/api";
import { FaDownload, FaSearch } from "react-icons/fa";

export default function InterviewHistory() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // 1. Fetch multi-question sessions from primary service
        const sessionsData = await getUserSessions(1);

        if (Array.isArray(sessionsData) && sessionsData.length > 0) {
          setHistory(sessionsData);
        } else {
          // 2. Fallback to legacy endpoint if session history is empty
          const res = await api.get("/interview/history");
          setHistory(res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Filter history based on search input
  const filtered = history.filter((item) =>
    (item.role || "").toLowerCase().includes(search.toLowerCase())
  );

  // Download PDF Report function
  const downloadReport = async (id) => {
    try {
      const response = await api.get(`/report/download/${id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Interview_Report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download Error:", err);
      alert("Unable to download report.");
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Interview History
        </h2>

        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3.5 top-3 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs uppercase bg-white/5 text-gray-400 border-b border-white/10">
            <tr>
              <th scope="col" className="px-4 py-3">Role</th>
              <th scope="col" className="px-4 py-3">Company</th>
              <th scope="col" className="px-4 py-3">Score</th>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3 text-right">Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-400">
                  Loading history...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-400">
                  No interview history found.
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => {
                const rawScore = item.average_score ?? item.overall_score ?? 0;
                const displayScore =
                  rawScore <= 10 ? Math.round(rawScore * 10) : Math.round(rawScore);

                return (
                  <tr
                    key={item.id || index}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4 font-semibold text-white">
                      {item.role || "Software Engineer"}
                    </td>

                    <td className="px-4 py-4 text-gray-400">
                      {item.company || "General"}
                    </td>

                    <td className="px-4 py-4 font-bold text-cyan-400">
                      {displayScore}%
                    </td>

                    <td className="px-4 py-4 text-gray-400 text-xs">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "Recent"}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => downloadReport(item.id)}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <FaDownload className="text-xs" />
                        PDF
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}