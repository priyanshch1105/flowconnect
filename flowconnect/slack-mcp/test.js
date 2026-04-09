require("dotenv").config();
const { sendSlackMessage, sendPaymentAlert, sendNotification, sendBlock } = require("./sendSlack");

async function test() {
  // Test 1: Simple message
  console.log("1️⃣  Sending message...");
  const r1 = await sendSlackMessage("Hello from FlowConnect! ✅", ":rocket:");
  console.log("✅ Message:", r1);

  // Test 2: Payment alert
  console.log("\n2️⃣  Sending payment alert...");
  const r2 = await sendPaymentAlert(999, "Priyanshi Sharma", "Pro Plan", "PAY_TEST_001");
  console.log("✅ Payment Alert:", r2);

  // Test 3: Notification
  console.log("\n3️⃣  Sending notification...");
  const r3 = await sendNotification("New Signup", "Priyanshi just signed up for FlowConnect!", "good");
  console.log("✅ Notification:", r3);

  // Test 4: Block message
  console.log("\n4️⃣  Sending block message...");
  const r4 = await sendBlock(
    "FlowConnect Daily Report 📊",
    "Here is your daily summary for today.",
    [
      { title: "Total Revenue", value: "₹9,999" },
      { title: "New Signups", value: "5" },
      { title: "Active Users", value: "120" },
      { title: "Pending Payments", value: "2" }
    ]
  );
  console.log("✅ Block:", r4);
}

test().catch(console.error);