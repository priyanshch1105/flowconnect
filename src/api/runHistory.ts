export interface ExecutionLog {
  id: string;
  workflow_id: string;
  workflow_name: string;
  success: boolean;
  payload: any;
  executed_at: string;
}

const AUTH_BASE = import.meta.env.VITE_AUTH_API_BASE_URL || "http://localhost:4000";

export async function getRunHistory(): Promise<ExecutionLog[]> {
  const token = localStorage.getItem("access_token");
  
  const res = await fetch(`${AUTH_BASE}/api/run-history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status}`);
  }

  return res.json();
}