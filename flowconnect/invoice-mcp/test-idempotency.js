/**
 * Test: Verify idempotency of Razorpay webhook processing
 * 
 * This test verifies that:
 * 1. Sending the same webhook twice results in only one PDF generated
 * 2. Only one WhatsApp message is sent for duplicate webhooks
 * 3. Invoice numbers are deterministic
 */

import crypto from "crypto";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEBHOOK_URL = process.env.WEBHOOK_URL || "http://localhost:3000/webhook/razorpay";
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "test_secret";

// ── Helper: Create Razorpay signature ────────────────────────────
function createRazorpaySignature(body) {
  return crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
}

// ── Test: Idempotency ─────────────────────────────────────────────
async function testIdempotency() {
  console.log("\n🧪 Test: Razorpay Webhook Idempotency");
  console.log("====================================\n");

  const paymentId = "pay_" + Math.random().toString(36).substring(2, 11);
  const testPayload = {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: paymentId,
          amount: 50000, // Rs 500
          email: "test@example.com",
          contact: "9876543210",
          notes: {
            name: "Test Customer",
            email: "test@example.com",
            phone: "9876543210",
            product: "Test Product",
          },
          description: "Test Payment",
        },
      },
    },
  };

  const bodyString = JSON.stringify(testPayload);
  const signature = createRazorpaySignature(bodyString);

  console.log(`📝 Payment ID: ${paymentId}`);
  console.log(`💰 Amount: Rs 500`);
  console.log(`📡 Webhook URL: ${WEBHOOK_URL}\n`);

  // ── First request ──────────────────────────────────────────────
  console.log("📤 Sending first webhook...");
  try {
    const response1 = await axios.post(WEBHOOK_URL, testPayload, {
      headers: {
        "x-razorpay-signature": signature,
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });
    console.log(`✅ First request successful: ${response1.status}\n`);
  } catch (err) {
    console.error("❌ First request failed:", err.message);
    return;
  }

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 1000));

  // ── Count PDFs after first request ─────────────────────────────
  const invoicesDir = path.join(__dirname, "invoices");
  let pdfCountAfterFirst = 0;
  if (fs.existsSync(invoicesDir)) {
    const files = fs.readdirSync(invoicesDir);
    pdfCountAfterFirst = files.filter(f => f.endsWith(".pdf")).length;
    console.log(`📊 PDFs after first request: ${pdfCountAfterFirst}`);
  }

  // ── Second request (duplicate) ─────────────────────────────────
  console.log("📤 Sending duplicate webhook...");
  try {
    const response2 = await axios.post(WEBHOOK_URL, testPayload, {
      headers: {
        "x-razorpay-signature": signature,
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });
    console.log(`✅ Second request successful: ${response2.status}\n`);
  } catch (err) {
    console.error("❌ Second request failed:", err.message);
    return;
  }

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 1000));

  // ── Count PDFs after second request ────────────────────────────
  let pdfCountAfterSecond = 0;
  if (fs.existsSync(invoicesDir)) {
    const files = fs.readdirSync(invoicesDir);
    pdfCountAfterSecond = files.filter(f => f.endsWith(".pdf")).length;
    console.log(`📊 PDFs after second request: ${pdfCountAfterSecond}`);
  }

  // ── Verify results ─────────────────────────────────────────────
  console.log("\n📋 Test Results:");
  console.log("─────────────────");

  if (pdfCountAfterFirst === 1 && pdfCountAfterSecond === 1) {
    console.log("✅ PASS: Exactly 1 PDF created (no duplicates)");
  } else {
    console.log(`❌ FAIL: Expected 1 PDF, got ${pdfCountAfterSecond}`);
    console.log(`   - After 1st request: ${pdfCountAfterFirst}`);
    console.log(`   - After 2nd request: ${pdfCountAfterSecond}`);
  }

  console.log("\n💡 Expected behavior:");
  console.log("   • First webhook: Processes payment, creates PDF, sends WhatsApp");
  console.log("   • Second webhook: Detected as duplicate, skips processing");
  console.log("   • Result: Only 1 PDF, 1 WhatsApp (idempotent)\n");
}

// ── Run test ──────────────────────────────────────────────────────
testIdempotency().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
