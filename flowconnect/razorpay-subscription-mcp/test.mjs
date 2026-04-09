import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function callTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [path.join(__dirname, "dist/index.js")], {
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

console.log("🔍 Testing Razorpay Subscription MCP...\n");

// Test 1: Get all subscriptions
try {
  console.log("1️⃣  Getting all subscriptions...");
  const result = await callTool("get_all_subscriptions", { count: 10 });
  console.log("✅ Subscriptions:", JSON.stringify(result, null, 2));
} catch (err) {
  console.error("❌ Error:", err.message);
}

// Test 2: Get subscription summary
try {
  console.log("\n2️⃣  Getting subscription summary...");
  const result = await callTool("get_subscription_summary", { count: 50 });
  console.log("✅ Summary:", JSON.stringify(result, null, 2));
} catch (err) {
  console.error("❌ Error:", err.message);
}

// Test 3: Get all plans
try {
  console.log("\n3️⃣  Getting all plans...");
  const result = await callTool("get_all_plans", { count: 10 });
  console.log("✅ Plans:", JSON.stringify(result, null, 2));
} catch (err) {
  console.error("❌ Error:", err.message);
}
