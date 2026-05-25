#!/usr/bin/env node

import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { register as registerSlack } from "./tools/slack.tool.js";
import { register as registerDiscord } from "./tools/discord.tool.js";
import { register as registerTelegram } from "./tools/telegram.tool.js";
import { register as registerRazorpay } from "./tools/razorpay.tool.js";
import { register as registerAirtable } from "./tools/airtable.tool.js";
import { register as registerZoho } from "./tools/zoho.tool.js";

const server = new McpServer({
  name: "pravah-mcp",
  version: "1.0.0",
});

const total = [
  registerSlack(server, z),
  registerDiscord(server, z),
  registerTelegram(server, z),
  registerRazorpay(server, z),
  registerAirtable(server, z),
  registerZoho(server, z),
].reduce((a, b) => a + b, 0);

process.stderr.write(`Pravah MCP server started — ${total} tool(s) registered\n`);

const transport = new StdioServerTransport();
await server.connect(transport);
