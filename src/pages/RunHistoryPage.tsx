import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getRunHistory, type ExecutionLog } from "../api/runHistory";

export default function RunHistoryPage() {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await getRunHistory();
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch run history", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const chartData = React.useMemo(() => {
    const dailyStats: Record<string, { date: string; success: number; failed: number }> = {};

    logs.forEach((log) => {
      const date = new Date(log.executed_at).toLocaleDateString();
      if (!dailyStats[date]) dailyStats[date] = { date, success: 0, failed: 0 };
      
      if (log.success) dailyStats[date].success += 1;
      else dailyStats[date].failed += 1;
    });

    return Object.values(dailyStats).reverse();
  }, [logs]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#6b7280" }}>
        Loading execution history...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 20px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Header */}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: "0 0 8px 0" }}>Run History</h1>
          <p style={{ color: "#6b7280", margin: 0, fontSize: 14 }}>View past workflow executions, success rates, and debug payloads.</p>
        </div>

        {/* Chart Section */}
        <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#374151", margin: "0 0 20px 0" }}>Execution Trends</h2>
          <div style={{ height: 300, width: "100%" }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="success" name="Successful Runs" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="failed" name="Failed Runs" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
                No data to display yet
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#374151", margin: 0 }}>Execution Logs</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", color: "#6b7280", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "12px 24px", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Timestamp</th>
                  <th style={{ padding: "12px 24px", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Workflow Name</th>
                  <th style={{ padding: "12px 24px", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Status</th>
                  <th style={{ padding: "12px 24px", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Payload / Error</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 14, color: "#374151" }}>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "16px 24px", whiteSpace: "nowrap", color: "#6b7280" }}>
                        {new Date(log.executed_at).toLocaleString()}
                      </td>
                      <td style={{ padding: "16px 24px", fontWeight: 500 }}>{log.workflow_name}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ 
                          padding: "4px 10px", 
                          borderRadius: 20, 
                          fontSize: 12, 
                          fontWeight: 600,
                          background: log.success ? "#dcfce7" : "#fee2e2",
                          color: log.success ? "#166534" : "#991b1b"
                        }}>
                          {log.success ? "Success" : "Failed"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px", maxWidth: 300 }}>
                        <div style={{ 
                          background: "#f9fafb", 
                          padding: 8, 
                          borderRadius: 6, 
                          fontSize: 11, 
                          fontFamily: "monospace", 
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {JSON.stringify(log.payload)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>
                      No executions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}