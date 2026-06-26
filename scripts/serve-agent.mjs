/**
 * Local dev server for the Blueprint agent (no Deno required).
 * Usage: node scripts/serve-agent.mjs
 */
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import handler from "../api/agent.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const PORT = Number(process.env.AGENT_PORT || 8000);

createServer(async (req, res) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (req.method === "OPTIONS") {
    res.writeHead(200, cors);
    return res.end();
  }
  if (req.url !== "/" && req.url !== "/agent") {
    res.writeHead(404, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify({ error: "POST /" }));
  }
  let body = "";
  for await (const chunk of req) body += chunk;
  const mockReq = { method: req.method, body: body ? JSON.parse(body) : {} };
  const mockRes = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(obj) {
      this.setHeader("Content-Type", "application/json");
      const h = { ...cors, ...this.headers };
      res.writeHead(this.statusCode, h);
      res.end(JSON.stringify(obj));
    },
    end() { res.writeHead(200, cors); res.end(); },
  };
  await handler(mockReq, mockRes);
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Blueprint agent → http://localhost:${PORT}`);
  console.log(`  (also http://127.0.0.1:${PORT} — keep this running while using Ask Blueprint)`);
});
