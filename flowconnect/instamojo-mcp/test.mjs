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

console.log("🔍 Testing Instamojo MCP...\n");

// Test 1: Get all payments
try {
  console.log("1️⃣  Getting payments...");
  const payments = await callTool("get_payments", { limit: 5 });
  console.log("✅ Payments:", JSON.stringify(payments, null, 2));
} catch (err) {
  console.error("❌ Payments Error:", err.message);
}

// Test 2: Get today's summary
try {
  console.log("\n2️⃣  Getting today's summary...");
  const summary = await callTool("get_todays_summary", {});
  console.log("✅ Summary:", JSON.stringify(summary, null, 2));
} catch (err) {
  console.error("❌ Summary Error:", err.message);
}

// Test 3: Get payment links
try {
  console.log("\n3️⃣  Getting payment links...");
  const links = await callTool("get_payment_links", { limit: 5 });
  console.log("✅ Links:", JSON.stringify(links, null, 2));
} catch (err) {
  console.error("❌ Links Error:", err.message);
}

// Test 4: Create a payment link
try {
  console.log("\n4️⃣  Creating a test payment link...");
  const link = await callTool("create_payment_link", {
    purpose: "FlowConnect Test Payment",
    amount: 1,
    name: "Priyanshi Sharma",
    email: "bjjvv87@gmail.com",
    phone: "8755735767"
  });
  console.log("✅ Payment Link Created:", JSON.stringify(link, null, 2));
} catch (err) {
  console.error("❌ Link Error:", err.message);
}