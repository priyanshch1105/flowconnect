import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_FILE = path.join(__dirname, ".idempotency_store.json");

/**
 * In-memory + file-backed idempotency store for webhook processing
 * Tracks processed payment IDs and their corresponding invoice numbers
 */
class IdempotencyStore {
  constructor() {
    this.store = this.loadFromDisk();
  }

  /**
   * Load store from disk file
   */
  loadFromDisk() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const data = fs.readFileSync(STORE_FILE, "utf-8");
        return JSON.parse(data);
      }
    } catch (err) {
      console.warn("⚠️  Failed to load idempotency store:", err.message);
    }
    return {};
  }

  /**
   * Save store to disk
   */
  saveToDisk() {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.store, null, 2), "utf-8");
    } catch (err) {
      console.error("❌ Failed to save idempotency store:", err.message);
      throw err;
    }
  }

  /**
   * Check if a payment has been processed
   * @param {string} paymentId - Razorpay payment ID
   * @returns {object|null} - Processed record {invoice_number, timestamp} or null
   */
  get(paymentId) {
    return this.store[paymentId] || null;
  }

  /**
   * Mark a payment as processed with its invoice number
   * @param {string} paymentId - Razorpay payment ID
   * @param {string} invoiceNumber - Generated invoice number
   */
  set(paymentId, invoiceNumber) {
    this.store[paymentId] = {
      invoice_number: invoiceNumber,
      timestamp: new Date().toISOString(),
      processed: true,
    };
    this.saveToDisk();
  }

  /**
   * Get all processed payments (for debugging/testing)
   */
  getAll() {
    return this.store;
  }

  /**
   * Clear the store (for testing)
   */
  clear() {
    this.store = {};
    this.saveToDisk();
  }
}

export default new IdempotencyStore();
