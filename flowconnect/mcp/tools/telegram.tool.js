export function register(server, z) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    process.stderr.write("[telegram] TELEGRAM_BOT_TOKEN not set — tools skipped\n");
    return 0;
  }

  const BASE = `https://api.telegram.org/bot${token}`;

  async function call(method, body = {}) {
    const r = await fetch(`${BASE}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!data.ok) throw new Error(`Telegram error: ${data.description}`);
    return data.result;
  }

  function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  server.tool(
    "telegram_send_message",
    "Send a text message to a Telegram chat, group, or channel.",
    {
      chat_id: z.string().describe("Chat ID or @channel_username. For groups use negative ID like -1001234567890."),
      message: z.string().describe("Message text (supports Markdown)"),
      parse_mode: z.enum(["Markdown", "HTML"]).optional().describe("Formatting mode"),
    },
    async ({ chat_id, message, parse_mode }) => {
      const result = await call("sendMessage", { chat_id, text: message, parse_mode: parse_mode || "Markdown" });
      return ok({ success: true, message_id: result.message_id, chat_id: result.chat.id });
    }
  );

  server.tool(
    "telegram_send_payment_alert",
    "Send a formatted payment/sales alert to a Telegram chat.",
    {
      chat_id: z.string().describe("Chat ID or @channel_username"),
      amount: z.number().describe("Payment amount in rupees"),
      customer_name: z.string().describe("Customer name"),
      plan: z.string().optional().describe("Plan or product purchased"),
      payment_id: z.string().optional().describe("Payment/transaction ID"),
    },
    async ({ chat_id, amount, customer_name, plan, payment_id }) => {
      const text =
        `💰 *New Payment Received!*\n\n` +
        `👤 *Customer:* ${customer_name}\n` +
        `💵 *Amount:* ₹${amount}\n` +
        (plan ? `📦 *Plan:* ${plan}\n` : "") +
        (payment_id ? `🔖 *Payment ID:* \`${payment_id}\`\n` : "") +
        `⏰ *Time:* ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`;
      const result = await call("sendMessage", { chat_id, text, parse_mode: "Markdown" });
      return ok({ success: true, message_id: result.message_id });
    }
  );

  server.tool(
    "telegram_get_bot_info",
    "Get information about the Telegram bot (name, username, ID).",
    {},
    async () => {
      const result = await call("getMe");
      return ok({ success: true, id: result.id, name: result.first_name, username: `@${result.username}` });
    }
  );

  server.tool(
    "telegram_get_updates",
    "Get recent messages sent to the bot. Useful for discovering chat IDs.",
    {},
    async () => {
      const result = await call("getUpdates");
      const chats = result.map(u => ({
        chat_id: u.message?.chat?.id,
        chat_type: u.message?.chat?.type,
        title: u.message?.chat?.title || u.message?.chat?.first_name,
        from: u.message?.from?.first_name,
        text: u.message?.text,
      }));
      return ok({ success: true, updates_count: result.length, chats });
    }
  );

  return 4;
}
