const http = require("http");

const port = process.env.PORT || 8080; // Use PORT from env or default
const baseDomain = "canyon-beta.com"; // Your base domain

const server = http.createServer((req, res) => {
  const requestHost = req.headers.host; // e.g., 'chat-frontend.canyon-beta.com' or 'canyon-beta.com'

  if (!requestHost) {
    console.log("Handling request without Host header");
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad Request: Host header is missing");
    return;
  }

  // Check if it's the base domain
  if (requestHost.toLowerCase() === baseDomain) {
    console.log(`Handling request for base domain ${requestHost} directly`);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok"); // Keep the 'ok' response for the base domain
    return;
  }

  // Check if it's a subdomain of the base domain
  if (requestHost.toLowerCase().endsWith(`.${baseDomain}`)) {
    const subdomain = requestHost.toLowerCase().replace(`.${baseDomain}`, ""); // Extract subdomain part
    const targetApp = subdomain; // Use subdomain directly as the target app name

    // Replay to the target app based on subdomain
    console.log(
      `Replaying request for ${requestHost} (subdomain: ${subdomain}) directly to app ${targetApp}`
    );
    res.writeHead(200, {
      "fly-replay": `app=${targetApp}`, // Use app field for cross-app replay
    });
    res.end(); // Empty body for replay
    return;
  } else {
    // Handle requests for hosts that don't match the base domain or its subdomains - respond with 'ok'
    console.log(`Handling request for unrelated host ${requestHost}`);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
    return;
  }
});

server.listen(port, () => {
  console.log(`Router server listening on port ${port}`);
  console.log(
    `Dynamically routing subdomains of ${baseDomain} to Fly apps matching the subdomain name.`
  );
  console.log(`Requests to ${baseDomain} will receive 'ok'`);
});
