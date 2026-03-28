/**
 * Next prints "Network: http://0.0.0.0:3000" — browsers cannot open 0.0.0.0.
 * Print URLs that actually work.
 */
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
let port = process.env.FRONTEND_PORT || "3000";
let serverIp = "";
try {
  const text = fs.readFileSync(envPath, "utf8");
  const mPort = text.match(/^FRONTEND_PORT=(.+)$/m);
  const mIp = text.match(/^SERVER_IP=(.+)$/m);
  if (mPort) port = mPort[1].trim();
  if (mIp) serverIp = mIp[1].trim();
} catch {
  /* no .env.local */
}

const p = port || "3000";
console.log("");
console.log("  --- Open in browser (do NOT use 0.0.0.0) ---");
console.log(`  This PC:     http://localhost:${p}`);
if (serverIp && serverIp !== "localhost") {
  console.log(`  Phone / LAN: http://${serverIp}:${p}`);
}
console.log("");
