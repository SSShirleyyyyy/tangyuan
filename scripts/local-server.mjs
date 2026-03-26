import http from "node:http";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

const CONTENT_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
]);

function getContentType(filePath) {
  return CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

export function resolveRequestPath(rootDir, requestUrl) {
  const rawPath = String(requestUrl).split("?")[0];
  if (/(^|\/)\.\.(\/|$)/.test(rawPath)) {
    return null;
  }

  const url = new URL(requestUrl, "http://127.0.0.1");
  const pathname = decodeURIComponent(url.pathname);
  const relativePath = pathname === "/" ? "/index.html" : pathname;
  const normalizedPath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const resolvedPath = path.resolve(rootDir, `.${normalizedPath}`);
  const resolvedRoot = path.resolve(rootDir);

  if (
    resolvedPath !== resolvedRoot &&
    !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    return null;
  }

  return resolvedPath;
}

export function createLocalDevServer({ rootDir = process.cwd() } = {}) {
  return http.createServer(async (request, response) => {
    const resolvedPath = resolveRequestPath(rootDir, request.url || "/");

    if (!resolvedPath) {
      response.writeHead(403, {
        ...NO_CACHE_HEADERS,
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end("Forbidden");
      return;
    }

    let filePath = resolvedPath;

    try {
      const fileStat = await stat(filePath);
      if (fileStat.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }

      const body = await readFile(filePath);
      response.writeHead(200, {
        ...NO_CACHE_HEADERS,
        "Content-Type": getContentType(filePath),
        "Content-Length": String(body.byteLength),
      });
      response.end(body);
    } catch {
      response.writeHead(404, {
        ...NO_CACHE_HEADERS,
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end("Not Found");
    }
  });
}

async function startServer() {
  const port = Number(process.env.PORT || 4173);
  const host = process.env.HOST || "127.0.0.1";
  const rootDir = process.cwd();
  const server = createLocalDevServer({ rootDir });

  server.listen(port, host, () => {
    console.log(`Local dev server running at http://${host}:${port}`);
  });
}

const entryPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";

if (import.meta.url === entryPath) {
  startServer();
}
