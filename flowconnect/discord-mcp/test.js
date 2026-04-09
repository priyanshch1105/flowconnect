require("dotenv").config();
const { sendDiscordMessage, sendPaymentAlert, sendNotification } = require("./sendDiscord");

async function test() {
  // Test 1: Simple message
  const r1 = await sendDiscordMessage("Hello from FlowConnect! ✅");
  console.log("Message:", r1);

  // Test 2: Payment alert
  const r2 = await sendPaymentAlert(999, "Priyanshi Sharma", "Pro Plan", "PAY_TEST_001");
  console.log("Payment Alert:", r2);

  // Test 3: Notification
  const r3 = await sendNotification("New Signup", "Priyanshi just signed up for FlowConnect!");
  console.log("Notification:", r3);
}

test().catch(console.error);