import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = normalize(join(process.cwd(), process.argv[2] ?? "dist"));
const port = Number(process.argv[3] ?? 4173);
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".map": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url?.split("?")[0] ?? "/");
  const candidate = normalize(join(root, requestPath));
  const isInsideRoot = candidate === root || candidate.startsWith(`${root}/`);
  const filePath = isInsideRoot && existsSync(candidate) && statSync(candidate).isFile()
    ? candidate
    : join(root, "index.html");

  response.setHeader(
    "Content-Type",
    contentTypes[extname(filePath)] ?? "application/octet-stream",
  );
  createReadStream(filePath).on("error", () => {
    response.statusCode = 500;
    response.end("Unable to serve the application");
  }).pipe(response);
}).listen(port, "localhost", () => {
  console.log(`SPA server listening on http://localhost:${port}`);
});
