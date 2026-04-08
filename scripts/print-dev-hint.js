/**
 * Optional: print LAN hints after loading .env (same rules as dev — requires NEXT_PUBLIC_API_URL + FRONTEND_PORT).
 */
const path = require('path');
const { loadFrontendEnv, assertRequiredFrontendEnv, printDevHint } = require('./load-env-frontend');

loadFrontendEnv(path.join(__dirname, '..'));
assertRequiredFrontendEnv();
printDevHint();
