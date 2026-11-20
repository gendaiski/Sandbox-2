import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import {
  Lens,
  parseGraphDoc,
  PrLensSchemaError,
  assertNever,
  SCHEMA_VERSION,
} from "@coldtea/pr-lens-schema";
import {
  render,
  renderAll,
  renderWalkthroughEmbed,
  flattenViews,
  PrLensRenderError,
  RENDERER_NAME,
  RENDERER_VERSION,
} from "@coldtea/pr-lens-renderer";
import { caseCatalog, caseDocuments } from "./case-data.js";

const MAX_BODY_BYTES = 4_000_000;
const Input = z.object({
  document: z.unknown(),
  theme: z.enum(["light", "dark"]).default("dark"),
  lens: Lens.optional(),
  viewId: z.string().max(160).optional(),
}).strict();

type ApiResponse = { status: number; body: unknown };
type RequestErrorCode = "INVALID_REQUEST" | "TOO_LARGE" | "NOT_FOUND" | "METHOD_NOT_ALLOWED";

class RequestError extends Error {
  constructor(readonly code: RequestErrorCode, message: string) {
    super(message);
  }
}

function requestErrorStatus(code: RequestErrorCode): number {
  switch (code) {
    case "INVALID_REQUEST": return 400;
    case "TOO_LARGE": return 413;
    case "NOT_FOUND": return 404;
    case "METHOD_NOT_ALLOWED": return 405;
    default: return assertNever(code);
  }
}

export function processApi(method: string, path: string, raw: unknown): ApiResponse {
  try {
    if (method === "GET" && path === "/api/health") {
      return { status: 200, body: { ok: true, renderer: RENDERER_VERSION, schema: SCHEMA_VERSION, cases: caseCatalog.length, storage: "stateless" } };
    }
    if (method === "GET" && path === "/api/cases") {
      return { status: 200, body: { cases: caseCatalog } };
    }
    if (method === "GET" && path.startsWith("/api/cases/")) {
      const id = path.slice("/api/cases/".length);
      const document = caseDocuments[id];
      if (document === undefined) throw new RequestError("NOT_FOUND", "Case not found");
      return { status: 200, body: { document: parseGraphDoc(document) } };
    }
    if (!["/api/render", "/api/validate", "/api/render-all"].includes(path)) {
      throw new RequestError("NOT_FOUND", "Endpoint not found");
    }
    if (method !== "POST") throw new RequestError("METHOD_NOT_ALLOWED", "Use POST for this endpoint");
    const input = Input.parse(raw);
    const document = parseGraphDoc(input.document);
    if (path === "/api/validate") return { status: 200, body: { ok: true, document } };
    if (path === "/api/render-all") {
      const rendered = renderAll(document);
      return { status: 200, body: { ...rendered, document, renderer: { name: RENDERER_NAME, version: RENDERER_VERSION } } };
    }
    const lens = input.lens ?? document.lenses[0];
    if (lens === undefined) throw new RequestError("INVALID_REQUEST", "Choose a lens declared in the document");
    const rendered = render(document, { theme: input.theme, lens, view: input.viewId });
    return {
      status: 200,
      body: {
        ...rendered,
        document,
        views: flattenViews(document.views).map(({ id, title, lens, summary }) => ({ id, title, lens, summary })),
        walkthrough: renderWalkthroughEmbed(document, { theme: input.theme }),
        renderer: { name: RENDERER_NAME, version: RENDERER_VERSION },
      },
    };
  } catch (error) {
    if (error instanceof RequestError) {
      return { status: requestErrorStatus(error.code), body: { error: { code: error.code, message: error.message } } };
    }
    if (error instanceof PrLensSchemaError) {
      return { status: 422, body: { error: { code: error.code, message: error.message, issues: error.issues } } };
    }
    if (error instanceof PrLensRenderError) {
      return { status: 422, body: { error: { code: error.code, message: error.message } } };
    }
    if (error instanceof z.ZodError) {
      return { status: 400, body: { error: { code: "INVALID_REQUEST", message: "Check the request fields", issues: error.issues } } };
    }
    return { status: 500, body: { error: { code: "INTERNAL_ERROR", message: "The renderer could not complete this request" } } };
  }
}

async function readBody(request: IncomingMessage): Promise<unknown> {
  if ("body" in request && request.body !== undefined) {
    const encoded = typeof request.body === "string" ? request.body : JSON.stringify(request.body);
    if (encoded === undefined) throw new RequestError("INVALID_REQUEST", "Send a JSON document");
    if (Buffer.byteLength(encoded) > MAX_BODY_BYTES) throw new RequestError("TOO_LARGE", "The document exceeds 4 MB");
    return JSON.parse(encoded);
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.length;
    if (size > MAX_BODY_BYTES) throw new RequestError("TOO_LARGE", "The document exceeds 4 MB");
    chunks.push(bytes);
  }
  if (size === 0) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  let result: ApiResponse;
  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    const route = url.searchParams.get("route");
    const path = route === null ? url.pathname : `/api/${route}`;
    const body = request.method === "POST" ? await readBody(request) : undefined;
    result = processApi(request.method ?? "GET", path, body);
  } catch (error) {
    result = error instanceof RequestError
      ? { status: requestErrorStatus(error.code), body: { error: { code: error.code, message: error.message } } }
      : { status: 400, body: { error: { code: "INVALID_REQUEST", message: "Send valid JSON" } } };
  }
  response.statusCode = result.status;
  response.end(JSON.stringify(result.body));
}
