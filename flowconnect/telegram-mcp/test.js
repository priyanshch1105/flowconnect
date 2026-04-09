require("dotenv").config();
const { getBotInfo, getUpdates, sendTelegramMessage, sendPaymentAlert } = require("./sendTelegram");

async function test() {
  // Test 1: Bot info
  console.log("1️⃣  Getting bot info...");
  const info = await getBotInfo();
  console.log("✅ Bot Info:", info);

  // Test 2: Get updates (to find chat ID)
  console.log("\n2️⃣  Getting updates...");
  const updates = await getUpdates();
  console.log("✅ Updates:", JSON.stringify(updates, null, 2));

  // Test 3: Send message — replace with your actual chat ID from step 4
  const CHAT_ID = "5550124094";

  console.log("\n3️⃣  Sending message...");
  const msg = await sendTelegramMessage(CHAT_ID, "Hello from FlowConnect! ✅");
  console.log("✅ Message:", msg);

  // Test 4: Payment alert
  console.log("\n4️⃣  Sending payment alert...");
  const alert = await sendPaymentAlert(CHAT_ID, 999, "Priyanshi Sharma", "Pro Plan", "PAY_TEST_001");
  console.log("✅ Payment Alert:", alert);
}

test().catch(console.error);
