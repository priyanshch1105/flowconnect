import axios from "axios";

export function register(server, z) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    process.stderr.write("[razorpay] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set — tools skipped\n");
    return 0;
  }

  const auth = { username: keyId, password: keySecret };
  const BASE = "https://api.razorpay.com/v1";

  function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  server.tool(
    "razorpay_get_todays_payments",
    "Get all payments received today with total amount.",
    {},
    async () => {
      const now = Math.floor(Date.now() / 1000);
      const start = now - (now % 86400);
      const { data } = await axios.get(`${BASE}/payments`, { auth, params: { from: start, to: now, count: 100 } });
      const payments = data.items || [];
      const captured = payments.filter(p => p.status === "captured");
      const total = captured.reduce((s, p) => s + p.amount, 0) / 100;
      return ok({
        date: new Date().toLocaleDateString("en-IN"),
        total_payments: payments.length,
        captured_payments: captured.length,
        total_amount: `Rs.${total.toFixed(2)}`,
        payments: captured.map(p => ({
          id: p.id,
          amount: `Rs.${(p.amount / 100).toFixed(2)}`,
          method: p.method,
          email: p.email,
          contact: p.contact,
          status: p.status,
          time: new Date(p.created_at * 1000).toLocaleTimeString("en-IN"),
        })),
      });
    }
  );

  server.tool(
    "razorpay_get_payments_by_range",
    "Get payments between two dates.",
    {
      from_date: z.string().describe("Start date YYYY-MM-DD"),
      to_date: z.string().describe("End date YYYY-MM-DD"),
    },
    async ({ from_date, to_date }) => {
      const from = Math.floor(new Date(from_date).getTime() / 1000);
      const to = Math.floor(new Date(to_date).getTime() / 1000) + 86400;
      const { data } = await axios.get(`${BASE}/payments`, { auth, params: { from, to, count: 100 } });
      const payments = data.items || [];
      const total = payments.reduce((s, p) => s + p.amount, 0) / 100;
      return ok({
        from: from_date,
        to: to_date,
        total_payments: payments.length,
        total_amount: `Rs.${total.toFixed(2)}`,
        payments: payments.map(p => ({
          id: p.id,
          amount: `Rs.${(p.amount / 100).toFixed(2)}`,
          method: p.method,
          status: p.status,
          email: p.email,
          date: new Date(p.created_at * 1000).toLocaleDateString("en-IN"),
        })),
      });
    }
  );

  server.tool(
    "razorpay_get_payment_details",
    "Get details of a specific payment by ID.",
    { payment_id: z.string().describe("Razorpay payment ID e.g. pay_ABC123") },
    async ({ payment_id }) => {
      const { data: p } = await axios.get(`${BASE}/payments/${payment_id}`, { auth });
      return ok({
        id: p.id,
        amount: `Rs.${(p.amount / 100).toFixed(2)}`,
        currency: p.currency,
        status: p.status,
        method: p.method,
        email: p.email,
        contact: p.contact,
        description: p.description,
        created_at: new Date(p.created_at * 1000).toLocaleString("en-IN"),
      });
    }
  );

  server.tool(
    "razorpay_get_payment_summary",
    "Get payment summary — total revenue, success rate, top methods for the past N days.",
    { days: z.number().describe("Number of past days to analyze e.g. 7, 30") },
    async ({ days }) => {
      const now = Math.floor(Date.now() / 1000);
      const from = now - days * 86400;
      const { data } = await axios.get(`${BASE}/payments`, { auth, params: { from, to: now, count: 100 } });
      const payments = data.items || [];
      const captured = payments.filter(p => p.status === "captured");
      const failed = payments.filter(p => p.status === "failed");
      const total = captured.reduce((s, p) => s + p.amount, 0) / 100;
      const methods = {};
      captured.forEach(p => { methods[p.method] = (methods[p.method] || 0) + 1; });
      return ok({
        period: `Last ${days} days`,
        total_transactions: payments.length,
        successful: captured.length,
        failed: failed.length,
        success_rate: payments.length ? `${((captured.length / payments.length) * 100).toFixed(1)}%` : "N/A",
        total_revenue: `Rs.${total.toFixed(2)}`,
        payment_methods: methods,
      });
    }
  );

  return 4;
}
