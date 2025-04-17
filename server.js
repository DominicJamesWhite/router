const http = require("http");

const port = process.env.PORT || 8080; // Use PORT from env or default
const allowedBaseDomains = ["canyon-beta.com", "canyon-alpha.com"]; // Allowed base domains

const server = http.createServer((req, res) => {
  const requestHost = req.headers.host; // e.g., 'chat-frontend.canyon-beta.com' or 'canyon-beta.com'

  if (!requestHost) {
    console.log("Handling request without Host header");
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad Request: Host header is missing");
    return;
  }

  const requestHostLower = requestHost.toLowerCase();
  let matchedBaseDomain = null;
  let isBaseDomainMatch = false;
  let isSubdomainMatch = false;
  let subdomain = null;

  // Check if it matches any allowed base domain exactly or as a subdomain
  for (const domain of allowedBaseDomains) {
    if (requestHostLower === domain) {
      matchedBaseDomain = domain;
      isBaseDomainMatch = true;
      break;
    }
    if (requestHostLower.endsWith(`.${domain}`)) {
      matchedBaseDomain = domain;
      isSubdomainMatch = true;
      subdomain = requestHostLower.replace(`.${domain}`, "");
      break;
    }
  }

  if (isBaseDomainMatch) {
    // Handle base domain request (e.g., canyon-beta.com or canyon-alpha.com)
    console.log(`Handling request for base domain ${requestHost} directly`);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
  } else if (isSubdomainMatch) {
    // Handle subdomain request (e.g., app.canyon-beta.com or app.canyon-alpha.com)
    const targetApp = subdomain; // Use subdomain directly as the target app name
    console.log(
      `Replaying request for ${requestHost} (subdomain: ${subdomain} of ${matchedBaseDomain}) directly to app ${targetApp}`
    );
    res.writeHead(200, {
      "fly-replay": `app=${targetApp}`, // Use app field for cross-app replay
    });
    res.end(); // Empty body for replay
  } else {
    // Handle requests for hosts that don't match the allowed domains or their subdomains
    console.log(`Handling request for unrelated host ${requestHost}`);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
  }
});

server.listen(port, () => {
  console.log(`Router server listening on port ${port}`);
  console.log(
    `Dynamically routing subdomains of ${allowedBaseDomains.join(
      " and "
    )} to Fly apps matching the subdomain name.`
  );
  console.log(
    `Requests to ${allowedBaseDomains.join(" or ")} will receive 'ok'`
  );
});
