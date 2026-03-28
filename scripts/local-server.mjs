import http from "node:http";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import {
  buildBeanVisionPrompt,
  extractJsonObject,
  sanitizeModelBeanDetails,
} from "../src/model-photo-analysis.js";

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
  [".webmanifest", "application/manifest+json; charset=utf-8"],
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

function sendJson(response, statusCode, payload) {
  const body = Buffer.from(JSON.stringify(payload));
  response.writeHead(statusCode, {
    ...NO_CACHE_HEADERS,
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": String(body.byteLength),
  });
  response.end(body);
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function extractResponseText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const textParts = [];

  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string" && content.text.trim()) {
        textParts.push(content.text.trim());
      }
    }
  }

  return textParts.join("\n").trim();
}

export async function analyzePhotoWithOpenAI({
  imageDataUrl,
  mode = "brew",
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_VISION_MODEL || "gpt-5",
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetchImpl("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildBeanVisionPrompt(mode),
            },
            {
              type: "input_image",
              image_url: imageDataUrl,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const failureText = await response.text();
    throw new Error(`OpenAI photo analysis failed: ${response.status} ${failureText}`);
  }

  const payload = await response.json();
  const raw = extractResponseText(payload);

  return {
    model,
    mode,
    bean: sanitizeModelBeanDetails(extractJsonObject(raw)),
    raw,
  };
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

export function createLocalDevServer({
  rootDir = process.cwd(),
  analyzePhoto = process.env.OPENAI_API_KEY ? analyzePhotoWithOpenAI : null,
} = {}) {
  return http.createServer(async (request, response) => {
    if (
      request.method === "GET" &&
      new URL(request.url || "/", "http://127.0.0.1").pathname === "/health"
    ) {
      sendJson(response, 200, {
        ok: true,
        service: "pourover-journal",
        photoAnalysis: Boolean(analyzePhoto),
      });
      return;
    }

    if (
      request.method === "POST" &&
      new URL(request.url || "/", "http://127.0.0.1").pathname === "/api/photo-analyze"
    ) {
      if (!analyzePhoto) {
        sendJson(response, 503, {
          error: "OPENAI_API_KEY 未配置，当前无法使用大模型图片识别。",
        });
        return;
      }

      try {
        const body = await readJsonBody(request);
        const imageDataUrl = String(body.imageDataUrl || "");
        const mode = body.mode === "inventory" ? "inventory" : "brew";

        if (!/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(imageDataUrl)) {
          sendJson(response, 400, {
            error: "图片数据无效，无法发起识别。",
          });
          return;
        }

        const result = await analyzePhoto({
          imageDataUrl,
          mode,
        });

        sendJson(response, 200, result);
      } catch (error) {
        sendJson(response, 500, {
          error:
            error instanceof Error
              ? error.message
              : "图片识别服务暂时不可用。",
        });
      }
      return;
    }

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
