- [ ] Add idempotency guard to Razorpay webhook invoice generation (processPaymentInvoice) using a durable marker keyed by payment_id.
- [ ] Make fallback invoice number deterministic (no Math.random()) so repeated processing yields the same invoice_number.
- [ ] Return “already processed” when duplicate webhook arrives.
- [ ] Add/adjust a simple regression test or manual test flow for duplicate webhook delivery.

