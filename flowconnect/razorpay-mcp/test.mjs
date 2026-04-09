import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function callTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [path.join(__dirname, "index.js")], {
      env: { ...process.env },
      stdio: ["pipe", "pipe", "inherit"],
    });

    let buffer = "", initialized = false, done = false;

    child.stdout.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (!initialized && msg.id === 1 && msg.result?.serverInfo) {
            initialized = true;
            child.stdin.write(JSON.stringify({
              jsonrpc: "2.0", id: 2,
              method: "tools/call",
              params: { name: toolName, arguments: args },
            }) + "\n");
          }
          if (msg.id === 2 && !done) {
            done = true;
            child.kill();
            if (msg.result?.isError) reject(new Error(msg.result.content[0].text));
            else resolve(JSON.parse(msg.result.content[0].text));
          }
        } catch (e) {}
      }
    });

    child.on("error", (err) => { if (!done) { done = true; reject(err); } });
    child.on("close", (code) => {
      if (!done && code !== 0 && code !== null) { done = true; reject(new Error(`Exited: ${code}`)); }
    });

    child.stdin.write(JSON.stringify({
      jsonrpc: "2.0", id: 1,
      method: "initialize",
      params: { protocolVersion: "2024-11-05", clientInfo: { name: "test", version: "1.0.0" }, capabilities: {} },
    }) + "\n");

    setTimeout(() => { if (!done) { done = true; child.kill(); reject(new Error("Timeout")); } }, 15000);
  });
}

console.log("🔍 Testing Razorpay MCP...\n");

// Test 1: Today's payments
try {
  console.log("1️⃣  Getting today's payments...");
  const result = await callTool("get_todays_payments", {});
  console.log("✅ Today's Payments:", JSON.stringify(result, null, 2));
} catch (err) {
  console.error("❌ Error:", err.message);
}

// Test 2: Payment summary for last 30 days
try {
  console.log("\n2️⃣  Getting 30-day summary...");
  const result = await callTool("get_payment_summary", { days: 30 });
  console.log("✅ Summary:", JSON.stringify(result, null, 2));
} catch (err) {
  console.error("❌ Error:", err.message);
}

// Test 3: Payments by date range
try {
  console.log("\n3️⃣  Getting payments by date range...");
  const result = await callTool("get_payments_by_range", {
    from_date: "2026-01-01",
    to_date: "2026-04-09"
  });
  console.log("✅ Range Payments:", JSON.stringify(result, null, 2));
} catch (err) {
  console.error("❌ Error:", err.message);
}