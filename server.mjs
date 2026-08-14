import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const port = Number.parseInt(process.env.PORT ?? "8080", 10);
const distRoot = fileURLToPath(new URL("./dist", import.meta.url));
const invalidRequest = Symbol("invalid-request");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function safePath(requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  } catch {
    return invalidRequest;
  }
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const candidate = normalize(join(distRoot, relativePath));
  return candidate === distRoot || candidate.startsWith(`${distRoot}${sep}`) ? candidate : null;
}

async function resolveFile(requestUrl) {
  const candidate = safePath(requestUrl);
  if (candidate === invalidRequest) return invalidRequest;
  if (!candidate) return null;

  try {
    const metadata = await stat(candidate);
    return metadata.isFile() ? candidate : null;
  } catch {
    return null;
  }
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  const requestedFile = await resolveFile(request.url ?? "/");
  if (requestedFile === invalidRequest) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Invalid request path");
    return;
  }
  const filePath = requestedFile ?? join(distRoot, "index.html");

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Cache-Control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable",
      "Content-Length": body.byteLength,
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
    });
    if (request.method === "HEAD") response.end();
    else response.end(body);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Web build is unavailable");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Web server listening on port ${port}`);
});
