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

    let buffer = "";
    let initialized = false;
    let done = false;

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
            if (msg.result?.isError) {
              reject(new Error(msg.result.content[0].text));
            } else {
              resolve(JSON.parse(msg.result.content[0].text));
            }
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    });

    child.on("error", (err) => { if (!done) { done = true; reject(err); } });
    child.on("close", (code) => {
      if (!done && code !== 0 && code !== null) {
        done = true;
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    child.stdin.write(JSON.stringify({
      jsonrpc: "2.0", id: 1,
      method: "initialize",
      params: { protocolVersion: "2024-11-05", clientInfo: { name: "test", version: "1.0.0" }, capabilities: {} },
    }) + "\n");

    setTimeout(() => {
      if (!done) { done = true; child.kill(); reject(new Error("Timeout after 15s")); }
    }, 15000);
  });
}

const FORM_ID = "1w_jl3GFKZuz6o3Hg6HoJEAPmXj5k3YrOePDBHq730bQ";

console.log("🔍 Fetching latest form response...\n");

try {
  const result = await callTool("get_latest_response", { form_id: FORM_ID });
  console.log("✅ Latest Response:", JSON.stringify(result, null, 2));
} catch (err) {
  console.error("❌ Error:", err.message);
}