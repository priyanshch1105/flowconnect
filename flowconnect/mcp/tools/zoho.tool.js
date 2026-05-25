export function register(server, z) {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    process.stderr.write("[zoho] ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET / ZOHO_REFRESH_TOKEN not set — tools skipped\n");
    return 0;
  }

  let accessToken = null;
  let tokenExpiry = 0;

  async function getToken() {
    if (accessToken && Date.now() < tokenExpiry) return accessToken;
    const r = await fetch("https://accounts.zoho.in/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret, grant_type: "refresh_token" }),
    });
    const data = await r.json();
    if (!data.access_token) throw new Error(`Zoho token error: ${JSON.stringify(data)}`);
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return accessToken;
  }

  async function api(method, endpoint, body = null) {
    const token = await getToken();
    const opts = { method, headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" } };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`https://www.zohoapis.in/crm/v2/${endpoint}`, opts);
    const data = await r.json();
    if (data.status === "error" || (data.code && data.code !== 0)) throw new Error(`Zoho API error: ${JSON.stringify(data)}`);
    return data;
  }

  function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  server.tool(
    "zoho_create_lead",
    "Create a new lead in Zoho CRM after a payment or form submission.",
    {
      last_name: z.string().describe("Lead's last name (required by Zoho)"),
      email: z.string().describe("Lead's email address"),
      first_name: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      lead_source: z.string().optional().describe("e.g. 'Web', 'Payment', 'Razorpay'"),
      amount: z.number().optional().describe("Payment amount if from a payment"),
      description: z.string().optional(),
    },
    async (args) => {
      const data = await api("POST", "Leads", {
        data: [{
          Last_Name: args.last_name,
          Email: args.email,
          First_Name: args.first_name || "",
          Phone: args.phone || "",
          Company: args.company || "",
          Lead_Source: args.lead_source || "Web",
          Annual_Revenue: args.amount || 0,
          Description: args.description || "",
        }],
      });
      const lead = data.data?.[0];
      return ok({ success: lead?.code === "SUCCESS", lead_id: lead?.details?.id, message: `Lead created for ${args.first_name || ""} ${args.last_name}` });
    }
  );

  server.tool(
    "zoho_create_contact",
    "Create a new contact in Zoho CRM for a paying customer.",
    {
      last_name: z.string().describe("Contact's last name (required)"),
      email: z.string().describe("Contact's email"),
      first_name: z.string().optional(),
      phone: z.string().optional(),
      account_name: z.string().optional().describe("Company/account name"),
      description: z.string().optional(),
    },
    async (args) => {
      const data = await api("POST", "Contacts", {
        data: [{
          Last_Name: args.last_name,
          Email: args.email,
          First_Name: args.first_name || "",
          Phone: args.phone || "",
          Account_Name: args.account_name || "",
          Description: args.description || "",
        }],
      });
      const contact = data.data?.[0];
      return ok({ success: contact?.code === "SUCCESS", contact_id: contact?.details?.id, message: `Contact created for ${args.first_name || ""} ${args.last_name}` });
    }
  );

  server.tool(
    "zoho_create_deal",
    "Create a new deal/opportunity in Zoho CRM.",
    {
      deal_name: z.string().describe("Name of the deal"),
      stage: z.string().describe("Deal stage: Qualification, Value Proposition, Closed Won, Closed Lost"),
      amount: z.number().optional().describe("Deal amount in rupees"),
      contact_name: z.string().optional(),
      account_name: z.string().optional(),
      closing_date: z.string().optional().describe("Expected closing date YYYY-MM-DD"),
      description: z.string().optional(),
    },
    async (args) => {
      const defaultClose = new Date(Date.now() + 30 * 864e5).toISOString().split("T")[0];
      const data = await api("POST", "Deals", {
        data: [{
          Deal_Name: args.deal_name,
          Stage: args.stage || "Qualification",
          Amount: args.amount || 0,
          Contact_Name: args.contact_name || "",
          Account_Name: args.account_name || "",
          Closing_Date: args.closing_date || defaultClose,
          Description: args.description || "",
        }],
      });
      const deal = data.data?.[0];
      return ok({ success: deal?.code === "SUCCESS", deal_id: deal?.details?.id, message: `Deal '${args.deal_name}' created` });
    }
  );

  server.tool(
    "zoho_create_task",
    "Create a follow-up task in Zoho CRM.",
    {
      subject: z.string().describe("Task subject/title"),
      due_date: z.string().optional().describe("Due date YYYY-MM-DD"),
      status: z.string().optional().describe("Not Started, In Progress, Completed"),
      priority: z.string().optional().describe("High, Medium, Low"),
      description: z.string().optional(),
    },
    async (args) => {
      const defaultDue = new Date(Date.now() + 7 * 864e5).toISOString().split("T")[0];
      const data = await api("POST", "Tasks", {
        data: [{
          Subject: args.subject,
          Due_Date: args.due_date || defaultDue,
          Status: args.status || "Not Started",
          Priority: args.priority || "Medium",
          Description: args.description || "",
        }],
      });
      const task = data.data?.[0];
      return ok({ success: task?.code === "SUCCESS", task_id: task?.details?.id, message: `Task '${args.subject}' created` });
    }
  );

  server.tool(
    "zoho_get_leads",
    "Get the most recent leads from Zoho CRM.",
    { per_page: z.number().optional().describe("Number of leads to fetch (default 10)") },
    async ({ per_page }) => {
      const data = await api("GET", `Leads?per_page=${per_page || 10}&sort_by=Created_Time&sort_order=desc`);
      const leads = (data.data || []).map(l => ({
        id: l.id,
        name: `${l.First_Name || ""} ${l.Last_Name}`.trim(),
        email: l.Email,
        phone: l.Phone,
        company: l.Company,
        source: l.Lead_Source,
        created: l.Created_Time,
      }));
      return ok({ success: true, total: leads.length, leads });
    }
  );

  server.tool(
    "zoho_search_leads",
    "Search for leads in Zoho CRM by email or name.",
    {
      email: z.string().optional().describe("Email to search for"),
      name: z.string().optional().describe("Name to search for"),
    },
    async ({ email, name }) => {
      const endpoint = email
        ? `Leads/search?email=${encodeURIComponent(email)}`
        : `Leads/search?word=${encodeURIComponent(name || "")}`;
      const data = await api("GET", endpoint);
      return ok({ success: true, total: data.data?.length || 0, leads: data.data || [] });
    }
  );

  server.tool(
    "zoho_update_lead",
    "Update an existing lead in Zoho CRM by ID.",
    {
      lead_id: z.string().describe("Zoho CRM lead ID"),
      fields: z.record(z.any()).describe("Fields to update as key-value pairs"),
    },
    async ({ lead_id, fields }) => {
      const data = await api("PUT", `Leads/${lead_id}`, { data: [fields] });
      const lead = data.data?.[0];
      return ok({ success: lead?.code === "SUCCESS", lead_id, message: `Lead ${lead_id} updated` });
    }
  );

  return 7;
}
