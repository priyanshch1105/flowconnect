require("dotenv").config();
const http = require("http");

const CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3002/callback";

const authURL = `https://accounts.zoho.in/oauth/v2/auth?scope=ZohoCRM.modules.ALL,ZohoCRM.settings.ALL&client_id=${CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

console.log("\n=== ZOHO OAUTH SETUP ===\n");
console.log("1. Open this URL in your browser:\n");
console.log(authURL);
console.log("\n2. Login and Allow access");
console.log("3. This server will automatically get your refresh token\n");

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith("/callback")) return;

  const code = new URL(req.url, "http://localhost:3002").searchParams.get("code");
  if (!code) { res.end("No code found!"); return; }

  console.log("\nGot authorization code:", code);

  const resp = await fetch("https://accounts.zoho.in/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const data = await resp.json();
  console.log("\n=== YOUR TOKENS ===");
  console.log(JSON.stringify(data, null, 2));
  console.log("\n✅ Add this to your .env:");
  console.log(`ZOHO_REFRESH_TOKEN=${data.refresh_token}`);

  res.end(`
    <h1>✅ Success!</h1>
    <p><b>Refresh Token:</b> ${data.refresh_token}</p>
    <p>Copy this to your .env as ZOHO_REFRESH_TOKEN</p>
  `);

  server.close();
});

server.listen(3002, () => {
  console.log("Waiting on http://localhost:3002/callback...\n");
});
