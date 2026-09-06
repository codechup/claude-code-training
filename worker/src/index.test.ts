import { describe, expect, it } from 'vitest';
import worker, {
  countsKey,
  handleGetFeedback,
  handlePostFeedback,
  parseCounts,
  parseFeedbackPayload,
  rateLimitKey,
  type Env,
  type KVNamespaceLike,
} from './index.ts';

/** In-memory stand-in for a Cloudflare KV namespace — no real account needed. */
class MemoryKV implements KVNamespaceLike {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.has(key) ? (this.store.get(key) ?? null) : null;
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}

function makeEnv(): Env {
  return { FEEDBACK_KV: new MemoryKV() };
}

function postRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://cc.codechup.com/api/feedback', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('parseFeedbackPayload', () => {
  it('accepts a valid payload', () => {
    expect(parseFeedbackPayload({ lessonId: 'en/l1-beginner/m01-start/01-x', vote: 'up' })).toEqual(
      {
        lessonId: 'en/l1-beginner/m01-start/01-x',
        vote: 'up',
        lang: undefined,
      },
    );
  });

  it('accepts an optional lang string', () => {
    expect(parseFeedbackPayload({ lessonId: 'l1/m01/x', vote: 'down', lang: 'tr' })).toEqual({
      lessonId: 'l1/m01/x',
      vote: 'down',
      lang: 'tr',
    });
  });

  it('rejects a non-object body', () => {
    expect(parseFeedbackPayload(null)).toBeNull();
    expect(parseFeedbackPayload('lessonId')).toBeNull();
    expect(parseFeedbackPayload(42)).toBeNull();
  });

  it('rejects a missing or non-string lessonId', () => {
    expect(parseFeedbackPayload({ vote: 'up' })).toBeNull();
    expect(parseFeedbackPayload({ lessonId: 123, vote: 'up' })).toBeNull();
    expect(parseFeedbackPayload({ lessonId: '', vote: 'up' })).toBeNull();
  });

  it('rejects a lessonId with unsafe characters', () => {
    expect(parseFeedbackPayload({ lessonId: '../../etc/passwd', vote: 'up' })).toBeNull();
    expect(parseFeedbackPayload({ lessonId: 'x"; DROP TABLE', vote: 'up' })).toBeNull();
    expect(parseFeedbackPayload({ lessonId: '<script>', vote: 'up' })).toBeNull();
  });

  it('rejects an over-long lessonId', () => {
    expect(parseFeedbackPayload({ lessonId: 'a'.repeat(201), vote: 'up' })).toBeNull();
  });

  it('rejects a missing or invalid vote', () => {
    expect(parseFeedbackPayload({ lessonId: 'l1/m01/x' })).toBeNull();
    expect(parseFeedbackPayload({ lessonId: 'l1/m01/x', vote: 'maybe' })).toBeNull();
    expect(parseFeedbackPayload({ lessonId: 'l1/m01/x', vote: 1 })).toBeNull();
  });

  it('rejects a non-string lang', () => {
    expect(parseFeedbackPayload({ lessonId: 'l1/m01/x', vote: 'up', lang: 7 })).toBeNull();
  });
});

describe('parseCounts', () => {
  it('defaults to zero counts for null/invalid input', () => {
    expect(parseCounts(null)).toEqual({ up: 0, down: 0 });
    expect(parseCounts('not json')).toEqual({ up: 0, down: 0 });
    expect(parseCounts('{}')).toEqual({ up: 0, down: 0 });
    expect(parseCounts('{"up":"NaN","down":null}')).toEqual({ up: 0, down: 0 });
  });

  it('reads valid stored counts', () => {
    expect(parseCounts('{"up":3,"down":1}')).toEqual({ up: 3, down: 1 });
  });
});

describe('keys', () => {
  it('namespaces counts and rate-limit keys distinctly', () => {
    expect(countsKey('l1/m01/x')).toBe('counts:l1/m01/x');
    expect(rateLimitKey('l1/m01/x', 'test-client-a')).toBe('rl:l1/m01/x:test-client-a');
  });
});

describe('handlePostFeedback', () => {
  it('records a first vote and returns counts', async () => {
    const env = makeEnv();
    const res = await handlePostFeedback(postRequest({ lessonId: 'l1/m01/x', vote: 'up' }), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ up: 1, down: 0 });
  });

  it('increments existing counts across distinct clients', async () => {
    const env = makeEnv();
    await handlePostFeedback(
      postRequest({ lessonId: 'l1/m01/x', vote: 'up' }, { 'cf-connecting-ip': 'test-client-a' }),
      env,
    );
    const res = await handlePostFeedback(
      postRequest({ lessonId: 'l1/m01/x', vote: 'up' }, { 'cf-connecting-ip': 'test-client-b' }),
      env,
    );
    expect(await res.json()).toEqual({ up: 2, down: 0 });
  });

  it('is idempotent for a repeated vote from the same client', async () => {
    const env = makeEnv();
    const headers = { 'cf-connecting-ip': 'test-client-c' };
    await handlePostFeedback(postRequest({ lessonId: 'l1/m01/x', vote: 'up' }, headers), env);
    const res = await handlePostFeedback(
      postRequest({ lessonId: 'l1/m01/x', vote: 'up' }, headers),
      env,
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ up: 1, down: 0 });
  });

  it('tracks up and down independently', async () => {
    const env = makeEnv();
    await handlePostFeedback(
      postRequest({ lessonId: 'l1/m01/x', vote: 'up' }, { 'cf-connecting-ip': 'test-client-a' }),
      env,
    );
    const res = await handlePostFeedback(
      postRequest({ lessonId: 'l1/m01/x', vote: 'down' }, { 'cf-connecting-ip': 'test-client-b' }),
      env,
    );
    expect(await res.json()).toEqual({ up: 1, down: 1 });
  });

  it('returns 400 for invalid JSON', async () => {
    const env = makeEnv();
    const req = new Request('https://cc.codechup.com/api/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not json',
    });
    const res = await handlePostFeedback(req, env);
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid payload without touching KV', async () => {
    const env = makeEnv();
    const res = await handlePostFeedback(
      postRequest({ lessonId: 'l1/m01/x', vote: 'sideways' }),
      env,
    );
    expect(res.status).toBe(400);
    const counts = await handleGetFeedback('l1/m01/x', env);
    expect(await counts.json()).toEqual({ up: 0, down: 0 });
  });
});

describe('handleGetFeedback', () => {
  it('returns zero counts for an unknown lessonId', async () => {
    const env = makeEnv();
    const res = await handleGetFeedback('never/voted', env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ up: 0, down: 0 });
  });

  it('returns stored counts', async () => {
    const env = makeEnv();
    await handlePostFeedback(postRequest({ lessonId: 'l1/m01/x', vote: 'down' }), env);
    const res = await handleGetFeedback('l1/m01/x', env);
    expect(await res.json()).toEqual({ up: 0, down: 1 });
  });

  it('rejects an invalid lessonId', async () => {
    const env = makeEnv();
    const res = await handleGetFeedback('../nope', env);
    expect(res.status).toBe(400);
  });
});

describe('fetch (routing)', () => {
  it('routes POST /api/feedback', async () => {
    const env = makeEnv();
    const res = await worker.fetch(postRequest({ lessonId: 'l1/m01/x', vote: 'up' }), env);
    expect(res.status).toBe(200);
  });

  it('405s the wrong method on /api/feedback', async () => {
    const env = makeEnv();
    const res = await worker.fetch(
      new Request('https://cc.codechup.com/api/feedback', { method: 'GET' }),
      env,
    );
    expect(res.status).toBe(405);
  });

  it('routes GET /api/feedback/:lessonId, including a URL-encoded lessonId with slashes', async () => {
    const env = makeEnv();
    await handlePostFeedback(
      postRequest({ lessonId: 'en/l1-beginner/m01-start/01-x', vote: 'up' }),
      env,
    );
    const encoded = encodeURIComponent('en/l1-beginner/m01-start/01-x');
    const res = await worker.fetch(
      new Request(`https://cc.codechup.com/api/feedback/${encoded}`, { method: 'GET' }),
      env,
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ up: 1, down: 0 });
  });

  it('405s the wrong method on /api/feedback/:lessonId', async () => {
    const env = makeEnv();
    const res = await worker.fetch(
      new Request('https://cc.codechup.com/api/feedback/l1/m01/x', { method: 'DELETE' }),
      env,
    );
    expect(res.status).toBe(405);
  });

  it('404s an unrelated path', async () => {
    const env = makeEnv();
    const res = await worker.fetch(
      new Request('https://cc.codechup.com/api/other', { method: 'GET' }),
      env,
    );
    expect(res.status).toBe(404);
  });
});
