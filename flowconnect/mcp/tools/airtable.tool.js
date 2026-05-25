export function register(server, z) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!apiKey || !baseId) {
    process.stderr.write("[airtable] AIRTABLE_API_KEY / AIRTABLE_BASE_ID not set — tools skipped\n");
    return 0;
  }

  const TABLE = process.env.AIRTABLE_TABLE_NAME || "Payments";
  const BASE_URL = `https://api.airtable.com/v0/${baseId}`;

  async function req(method, endpoint, body = null) {
    const opts = {
      method,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`${BASE_URL}/${endpoint}`, opts);
    const data = await r.json();
    if (!r.ok) throw new Error(`Airtable error: ${data.error?.message || JSON.stringify(data)}`);
    return data;
  }

  function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  server.tool(
    "airtable_add_payment",
    "Add a new payment record to Airtable.",
    {
      customer_name: z.string().describe("Customer name"),
      amount: z.number().describe("Payment amount in rupees"),
      email: z.string().optional().describe("Customer email"),
      plan: z.string().optional().describe("Plan or product purchased"),
      payment_id: z.string().optional().describe("Payment/transaction ID"),
      status: z.string().optional().describe("Payment status: Success, Failed, Pending"),
      phone: z.string().optional().describe("Customer phone number"),
    },
    async ({ customer_name, amount, email, plan, payment_id, status, phone }) => {
      const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const data = await req("POST", encodeURIComponent(TABLE), {
        records: [{
          fields: {
            "Customer Name": customer_name,
            Amount: amount,
            Status: status || "Success",
            "Created At": now,
            ...(email && { Email: email }),
            ...(plan && { Plan: plan }),
            ...(payment_id && { "Payment ID": payment_id }),
            ...(phone && { Phone: phone }),
          },
        }],
      });
      return ok({ success: true, record_id: data.records[0].id, message: `Payment record added for ${customer_name} — ₹${amount}` });
    }
  );

  server.tool(
    "airtable_get_payments",
    "Get payment records from Airtable with optional status filter.",
    {
      max_records: z.number().optional().describe("Maximum records to fetch (default 10)"),
      filter_status: z.string().optional().describe("Filter by status: Success, Failed, Pending"),
    },
    async ({ max_records, filter_status }) => {
      let endpoint = `${encodeURIComponent(TABLE)}?maxRecords=${max_records || 10}`;
      if (filter_status) endpoint += `&filterByFormula=${encodeURIComponent(`{Status}="${filter_status}"`)}`;
      const data = await req("GET", endpoint);
      return ok({ success: true, total: data.records.length, records: data.records.map(r => ({ id: r.id, ...r.fields })) });
    }
  );

  server.tool(
    "airtable_add_record",
    "Add a custom record to any Airtable table.",
    {
      table_name: z.string().describe("Airtable table name"),
      fields: z.record(z.any()).describe("Key-value pairs of fields to add"),
    },
    async ({ table_name, fields }) => {
      const data = await req("POST", encodeURIComponent(table_name), { records: [{ fields }] });
      return ok({ success: true, record_id: data.records[0].id, message: `Record added to ${table_name}` });
    }
  );

  server.tool(
    "airtable_get_records",
    "Get records from any Airtable table.",
    {
      table_name: z.string().describe("Airtable table name"),
      max_records: z.number().optional().describe("Maximum records to fetch (default 10)"),
    },
    async ({ table_name, max_records }) => {
      const data = await req("GET", `${encodeURIComponent(table_name)}?maxRecords=${max_records || 10}`);
      return ok({ success: true, total: data.records.length, records: data.records.map(r => ({ id: r.id, ...r.fields })) });
    }
  );

  server.tool(
    "airtable_update_record",
    "Update an existing record in Airtable by record ID.",
    {
      table_name: z.string().describe("Airtable table name"),
      record_id: z.string().describe("Record ID (starts with 'rec')"),
      fields: z.record(z.any()).describe("Fields to update"),
    },
    async ({ table_name, record_id, fields }) => {
      const data = await req("PATCH", `${encodeURIComponent(table_name)}/${record_id}`, { fields });
      return ok({ success: true, record_id: data.id, message: `Record ${record_id} updated in ${table_name}` });
    }
  );

  server.tool(
    "airtable_search_records",
    "Search for records in an Airtable table by field value.",
    {
      table_name: z.string().describe("Airtable table name"),
      field_name: z.string().describe("Field name to search in"),
      search_value: z.string().describe("Value to search for"),
    },
    async ({ table_name, field_name, search_value }) => {
      const formula = encodeURIComponent(`SEARCH("${search_value}",{${field_name}})`);
      const data = await req("GET", `${encodeURIComponent(table_name)}?filterByFormula=${formula}`);
      return ok({ success: true, total: data.records.length, records: data.records.map(r => ({ id: r.id, ...r.fields })) });
    }
  );

  return 6;
}
