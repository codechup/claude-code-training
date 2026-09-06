// The `/api/feedback` Cloudflare Worker (D067/D069): the same-origin
// backend for `src/components/mdx/Helpful.astro`'s 👍/👎 control. Stores a
// running `{ up, down }` counter per `lessonId` in a KV namespace and
// applies a small per-client, per-lesson vote de-duplication window.
//
// Deliberately typed against a small local structural interface for the KV
// binding (`KVNamespaceLike`) and the platform's standard `Request`/
// `Response`/`URL` globals, instead of `@cloudflare/workers-types`'s
// ambient globals: this file is type-checked both here (`worker/tsconfig.json`)
// and, because the repo root's `tsconfig.json` has no `exclude` entry for
// `worker/**` (that file is outside this plan's owned_paths — see the
// plan's Handoff notes), by `npm run typecheck` (`astro check`) at the repo
// root too. Keeping this file's types self-contained means it passes in
// both places without pulling in a global `KVNamespace`/`ExecutionContext`
// ambient declaration that would only be installed in one of them.

export interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface Env {
  FEEDBACK_KV: KVNamespaceLike;
}

export type Vote = 'up' | 'down';

export interface FeedbackPayload {
  lessonId: string;
  vote: Vote;
  lang?: string;
}

export interface Counts {
  up: number;
  down: number;
}

const MAX_LESSON_ID_LENGTH = 200;
// Lesson ids look like `en/l1-beginner/m01-start/01-what-claude-code-is`
// (see `src/content.config.ts` / content collection entry ids) — letters,
// digits, `/`, `_`, `-` only.
const LESSON_ID_PATTERN = /^[a-z0-9/_-]+$/i;

// One vote per lesson per client counts toward the totals within this
// window; a retried or duplicate request in the same window is a no-op
// (idempotent), not an error, and not double-counted.
const RATE_LIMIT_TTL_SECONDS = 60 * 60 * 12; // 12h

/** Validate and narrow an unknown JSON body to a `FeedbackPayload`, or `null`. */
export function parseFeedbackPayload(body: unknown): FeedbackPayload | null {
  if (!body || typeof body !== 'object') return null;
  const { lessonId, vote, lang } = body as Record<string, unknown>;

  if (
    typeof lessonId !== 'string' ||
    lessonId.length === 0 ||
    lessonId.length > MAX_LESSON_ID_LENGTH
  ) {
    return null;
  }
  if (!LESSON_ID_PATTERN.test(lessonId)) return null;
  if (vote !== 'up' && vote !== 'down') return null;
  if (lang !== undefined && typeof lang !== 'string') return null;

  return { lessonId, vote, lang: typeof lang === 'string' ? lang : undefined };
}

export function countsKey(lessonId: string): string {
  return `counts:${lessonId}`;
}

export function rateLimitKey(lessonId: string, clientId: string): string {
  return `rl:${lessonId}:${clientId}`;
}

export function parseCounts(raw: string | null): Counts {
  if (!raw) return { up: 0, down: 0 };
  try {
    const parsed = JSON.parse(raw) as Partial<Counts>;
    return {
      up: typeof parsed.up === 'number' && Number.isFinite(parsed.up) ? parsed.up : 0,
      down: typeof parsed.down === 'number' && Number.isFinite(parsed.down) ? parsed.down : 0,
    };
  } catch {
    return { up: 0, down: 0 };
  }
}

function isValidLessonId(lessonId: string): boolean {
  return (
    lessonId.length > 0 &&
    lessonId.length <= MAX_LESSON_ID_LENGTH &&
    LESSON_ID_PATTERN.test(lessonId)
  );
}

function jsonResponse(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

/**
 * Cloudflare sets this header at the edge. Falls back to a constant so
 * `wrangler dev`/local tests without the real edge still behave sanely —
 * rate limiting there degrades to "one vote per lesson, globally", which is
 * fine for a local dev loop and never reached in production.
 */
function clientIdentifier(request: Request): string {
  return request.headers.get('cf-connecting-ip') ?? 'local';
}

export async function handleGetFeedback(lessonId: string, env: Env): Promise<Response> {
  if (!isValidLessonId(lessonId)) {
    return jsonResponse({ error: 'invalid lessonId' }, { status: 400 });
  }
  const counts = parseCounts(await env.FEEDBACK_KV.get(countsKey(lessonId)));
  return jsonResponse(counts, { status: 200 });
}

export async function handlePostFeedback(request: Request, env: Env): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid JSON body' }, { status: 400 });
  }

  const payload = parseFeedbackPayload(body);
  if (!payload) {
    return jsonResponse(
      { error: 'invalid payload: expected { lessonId: string, vote: "up"|"down" }' },
      {
        status: 400,
      },
    );
  }

  const clientId = clientIdentifier(request);
  const rlKey = rateLimitKey(payload.lessonId, clientId);
  const alreadyVoted = await env.FEEDBACK_KV.get(rlKey);
  const key = countsKey(payload.lessonId);

  if (alreadyVoted) {
    // Idempotent no-op: a retried/duplicate client request returns the
    // current counts without incrementing them again.
    return jsonResponse(parseCounts(await env.FEEDBACK_KV.get(key)), { status: 200 });
  }

  const counts = parseCounts(await env.FEEDBACK_KV.get(key));
  counts[payload.vote] += 1;
  await env.FEEDBACK_KV.put(key, JSON.stringify(counts));
  await env.FEEDBACK_KV.put(rlKey, '1', { expirationTtl: RATE_LIMIT_TTL_SECONDS });

  return jsonResponse(counts, { status: 200 });
}

function methodNotAllowed(allow: string): Response {
  return jsonResponse({ error: 'method not allowed' }, { status: 405, headers: { allow } });
}

const FEEDBACK_PATH = '/api/feedback';
const FEEDBACK_ITEM_PREFIX = '/api/feedback/';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === FEEDBACK_PATH) {
      if (request.method === 'POST') return handlePostFeedback(request, env);
      return methodNotAllowed('POST');
    }

    if (url.pathname.startsWith(FEEDBACK_ITEM_PREFIX)) {
      const rawId = url.pathname.slice(FEEDBACK_ITEM_PREFIX.length);
      if (request.method === 'GET') {
        let lessonId: string;
        try {
          lessonId = decodeURIComponent(rawId);
        } catch {
          return jsonResponse({ error: 'invalid lessonId' }, { status: 400 });
        }
        return handleGetFeedback(lessonId, env);
      }
      return methodNotAllowed('GET');
    }

    return jsonResponse({ error: 'not found' }, { status: 404 });
  },
};
