export function register(server, z) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    process.stderr.write("[discord] DISCORD_WEBHOOK_URL not set — tools skipped\n");
    return 0;
  }

  const AVATAR = "https://cdn-icons-png.flaticon.com/512/2936/2936886.png";

  async function post(payload) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`Discord error ${r.status}: ${await r.text()}`);
  }

  function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  server.tool(
    "discord_send_message",
    "Send a plain-text message to a Discord channel via webhook.",
    {
      message: z.string().describe("Message text"),
      username: z.string().optional().describe("Bot display name override"),
    },
    async ({ message, username }) => {
      await post({ content: message, username: username || "FlowConnect", avatar_url: AVATAR });
      return ok({ success: true, message: "Message sent to Discord" });
    }
  );

  server.tool(
    "discord_send_payment_alert",
    "Send a rich embedded payment alert to Discord.",
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
        avatar_url: AVATAR,
        embeds: [{
          title: "💰 New Payment Received!",
          color: 5763719,
          fields: [
            { name: "👤 Customer", value: customer_name, inline: true },
            { name: "💵 Amount", value: `₹${amount}`, inline: true },
            ...(plan ? [{ name: "📦 Plan", value: plan, inline: true }] : []),
            ...(payment_id ? [{ name: "🔖 Payment ID", value: `\`${payment_id}\``, inline: false }] : []),
            { name: "⏰ Time", value: now, inline: false },
          ],
          footer: { text: "FlowConnect" },
          timestamp: new Date().toISOString(),
        }],
      });
      return ok({ success: true, message: `Payment alert sent for ₹${amount} from ${customer_name}` });
    }
  );

  server.tool(
    "discord_send_embed",
    "Send a rich embedded message to Discord with title, description, color and optional fields.",
    {
      title: z.string().describe("Embed title"),
      description: z.string().describe("Embed body text"),
      color: z.number().optional().describe("Color as decimal e.g. 5763719 (green), 15548997 (red), 3447003 (blue)"),
      fields: z.array(z.object({ name: z.string(), value: z.string(), inline: z.boolean().optional() })).optional(),
    },
    async ({ title, description, color, fields }) => {
      await post({
        username: "FlowConnect",
        avatar_url: AVATAR,
        embeds: [{
          title,
          description,
          color: color || 3447003,
          fields: fields || [],
          timestamp: new Date().toISOString(),
          footer: { text: "FlowConnect" },
        }],
      });
      return ok({ success: true, message: "Embed sent to Discord" });
    }
  );

  server.tool(
    "discord_send_notification",
    "Send a general notification alert to Discord (new signup, form submit, etc.).",
    {
      event_type: z.string().describe("Event type e.g. 'New Signup', 'Form Submitted'"),
      details: z.string().describe("Details about the event"),
    },
    async ({ event_type, details }) => {
      const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      await post({
        username: "FlowConnect Alerts",
        avatar_url: AVATAR,
        embeds: [{
          title: `🔔 ${event_type}`,
          description: details,
          color: 3447003,
          fields: [{ name: "⏰ Time", value: now, inline: false }],
          timestamp: new Date().toISOString(),
          footer: { text: "FlowConnect" },
        }],
      });
      return ok({ success: true, message: `Notification sent: ${event_type}` });
    }
  );

  return 4;
}
