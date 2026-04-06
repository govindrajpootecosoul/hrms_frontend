/**
 * Next prints "Network: http://0.0.0.0:<port>" — browsers cannot open 0.0.0.0.
 * Print URLs that actually work.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
let port = process.env.FRONTEND_PORT || "3005";
let serverIp = "";
function readEnvFile(rel) {
  try {
    return fs.readFileSync(path.join(root, rel), "utf8");
  } catch {
    return null;
  }
}
for (const rel of [".env", ".env.local"]) {
  const text = readEnvFile(rel);
  if (!text) continue;
  const mPort = text.match(/^FRONTEND_PORT=(.+)$/m);
  const mIp = text.match(/^SERVER_IP=(.+)$/m);
  if (mPort) port = mPort[1].trim();
  if (mIp) serverIp = mIp[1].trim();
}

const p = port || "3005";
console.log("");
console.log("  --- Open in browser (do NOT use 0.0.0.0) ---");
console.log(`  This PC:     http://localhost:${p}`);
if (serverIp && serverIp !== "localhost") {
  console.log(`  Phone / LAN: http://${serverIp}:${p}`);
}
console.log("");
