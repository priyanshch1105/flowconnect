export function register(server, z) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    process.stderr.write("[slack] SLACK_WEBHOOK_URL not set — tools skipped\n");
    return 0;
  }

  async function post(payload) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`Slack error ${r.status}: ${await r.text()}`);
  }

  function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  server.tool(
    "slack_send_message",
    "Send a plain-text message to a Slack channel via webhook.",
    { message: z.string().describe("Message text"), emoji: z.string().optional().describe("Bot emoji e.g. ':rocket:'") },
    async ({ message, emoji }) => {
      await post({ text: message, icon_emoji: emoji || ":zap:", username: "FlowConnect" });
      return ok({ success: true, message: "Message sent to Slack" });
    }
  );

  server.tool(
    "slack_send_payment_alert",
    "Send a rich formatted payment alert to Slack.",
    {
      amount: z.number().describe("Payment amount in rupees"),
      customer_name: z.string().describe("Customer name"),
      plan: z.string().optional().describe("Plan or product purchased"),
      payment_id: z.string().optional().describe("Payment/transaction ID"),
    },
    async ({ amount, customer_name, plan, payment_id }) => {
      const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      await post({
        username: "FlowConnect Payments",
        icon_emoji: ":money_with_wings:",
        attachments: [{
          color: "good",
          title: "💰 New Payment Received!",
          fields: [
            { title: "👤 Customer", value: customer_name, short: true },
            { title: "💵 Amount", value: `₹${amount}`, short: true },
            ...(plan ? [{ title: "📦 Plan", value: plan, short: true }] : []),
            ...(payment_id ? [{ title: "🔖 Payment ID", value: payment_id, short: true }] : []),
            { title: "⏰ Time", value: now, short: false },
          ],
          footer: "FlowConnect",
          ts: Math.floor(Date.now() / 1000),
        }],
      });
      return ok({ success: true, message: `Payment alert sent for ₹${amount} from ${customer_name}` });
    }
  );

  server.tool(
    "slack_send_notification",
    "Send a general notification to Slack (new signup, form submit, new order, etc.).",
    {
      event_type: z.string().describe("Event type e.g. 'New Signup', 'Form Submitted'"),
      details: z.string().describe("Details about the event"),
      color: z.string().optional().describe("Sidebar color: 'good', 'warning', 'danger', or hex"),
    },
    async ({ event_type, details, color }) => {
      const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      await post({
        username: "FlowConnect Alerts",
        icon_emoji: ":bell:",
        attachments: [{
          color: color || "#0099ff",
          title: `🔔 ${event_type}`,
          text: details,
          fields: [{ title: "⏰ Time", value: now, short: false }],
          footer: "FlowConnect",
          ts: Math.floor(Date.now() / 1000),
        }],
      });
      return ok({ success: true, message: `Notification sent: ${event_type}` });
    }
  );

  server.tool(
    "slack_send_block",
    "Send a rich Block Kit message to Slack with a title, body, and optional fields.",
    {
      title: z.string().describe("Bold title of the message"),
      body: z.string().describe("Main body text (supports mrkdwn)"),
      fields: z.array(z.object({ title: z.string(), value: z.string() })).optional().describe("Optional {title, value} fields shown in two columns"),
    },
    async ({ title, body, fields }) => {
      const blocks = [
        { type: "header", text: { type: "plain_text", text: title, emoji: true } },
        { type: "section", text: { type: "mrkdwn", text: body } },
      ];
      if (fields?.length) {
        blocks.push({ type: "section", fields: fields.map(f => ({ type: "mrkdwn", text: `*${f.title}*\n${f.value}` })) });
      }
      blocks.push({ type: "divider" });
      await post({ username: "FlowConnect", icon_emoji: ":zap:", blocks });
      return ok({ success: true, message: "Block message sent to Slack" });
    }
  );

  return 4;
}
