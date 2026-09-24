import { useState, useEffect } from "react";

interface AuditEntry {
  id: number;
  user_id: string;
  query: string;
  response: string;
  sources: string;
  timestamp: string;
}

interface AuditStats {
  total_queries: number;
  unique_users: number;
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<AuditStats>({ total_queries: 0, unique_users: 0 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 15;

  const loadLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        search,
      });
      const res = await fetch(`/audit/?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch {}
  };

  const loadStats = async () => {
    try {
      const res = await fetch("/audit/stats");
      if (res.ok) setStats(await res.json());
    } catch {}
  };

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [page, search]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Queries</p>
          <p className="text-2xl font-bold text-white">{stats.total_queries}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Unique Users</p>
          <p className="text-2xl font-bold text-white">{stats.unique_users}</p>
        </div>
      </div>

      <div>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search queries and responses..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 mb-4"
        />

        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400 text-left">
              <tr>
                <th className="px-4 py-2 w-20">ID</th>
                <th className="px-4 py-2 w-28">User</th>
                <th className="px-4 py-2">Query</th>
                <th className="px-4 py-2">Response</th>
                <th className="px-4 py-2 w-40">Sources</th>
                <th className="px-4 py-2 w-44">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No audit records yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-2 text-gray-500">{log.id}</td>
                    <td className="px-4 py-2 text-gray-300">{log.user_id}</td>
                    <td className="px-4 py-2 text-gray-200 max-w-xs truncate">{log.query}</td>
                    <td className="px-4 py-2 text-gray-200 max-w-xs truncate">{log.response}</td>
                    <td className="px-4 py-2 text-gray-400 text-xs">{log.sources}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
          <span>
            Showing {(page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white"
            >
              Prev
            </button>
            <span className="px-3 py-1">
              {page}/{totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
