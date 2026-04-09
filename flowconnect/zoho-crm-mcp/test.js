require("dotenv").config();
const { spawn } = require("child_process");
const path = require("path");

function callZoho(toolName, args) {
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

async function test() {
  // Test 1: Get leads
  console.log("1️⃣  Getting leads...");
  try {
    const leads = await callZoho("get_leads", { per_page: 5 });
    console.log("✅ Leads:", JSON.stringify(leads, null, 2));
  } catch (err) {
    console.error("❌ Error:", err.message);
  }

  // Test 2: Create a lead
  console.log("\n2️⃣  Creating lead...");
  try {
    const lead = await callZoho("create_lead", {
      first_name: "Priyanshi",
      last_name: "Sharma",
      email: "bjjvv87@gmail.com",
      phone: "8755735767",
      company: "FlowConnect",
      lead_source: "Web",
      amount: 999,
      description: "Test lead from FlowConnect MCP"
    });
    console.log("✅ Lead Created:", JSON.stringify(lead, null, 2));
  } catch (err) {
    console.error("❌ Error:", err.message);
  }

  // Test 3: Search lead
  console.log("\n3️⃣  Searching lead...");
  try {
    const result = await callZoho("search_leads", { email: "bjjvv87@gmail.com" });
    console.log("✅ Search Result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

test().catch(console.error);