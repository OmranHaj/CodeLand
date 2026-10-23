import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JudgeService } from './judge.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const b64 = (s: string) => Buffer.from(s, 'utf-8').toString('base64');
const json = (body: unknown, status = 200) =>
  ({ ok: status < 400, status, json: async () => body }) as unknown as Response;

describe('JudgeService.executeBatch', () => {
  let service: JudgeService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    service = new JudgeService({} as PrismaService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('submits all inputs in one Judge0 batch and polls until every one finishes', async () => {
    fetchMock
      // POST /submissions/batch
      .mockResolvedValueOnce(json([{ token: 'a' }, { token: 'b' }, { token: 'c' }]))
      // first poll: still processing
      .mockResolvedValueOnce(json({ submissions: [{ status: { id: 3 } }, { status: { id: 2 } }, { status: { id: 1 } }] }))
      // second poll: done
      .mockResolvedValueOnce(
        json({
          submissions: [
            { status: { id: 3 }, stdout: b64('6\n'), time: '0.01' },
            { status: { id: 5 }, stdout: null, time: '2.0' },
            { status: { id: 6 }, stdout: null, compile_output: b64('main.cpp:1: error') },
          ],
        }),
      );

    const promise = service.executeBatch('code', 'cpp', ['20 3', '1 1', 'x'], 1, 128);
    await vi.advanceTimersByTimeAsync(2500);
    const results = await promise;

    const [post] = fetchMock.mock.calls[0];
    expect(post).toContain('/submissions/batch?base64_encoded=true');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.submissions).toHaveLength(3);
    expect(Buffer.from(body.submissions[0].stdin, 'base64').toString()).toBe('20 3');

    expect(results.map((r) => r.status)).toEqual(['SUCCESS', 'TIME_LIMIT_EXCEEDED', 'COMPILATION_ERROR']);
    expect(results[0].stdout).toBe('6\n');
    expect(results[2].compileError).toBe('main.cpp:1: error');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('falls back to one request per input when the batch API fails', async () => {
    fetchMock.mockResolvedValueOnce(json({ error: 'down' }, 503));
    const single = vi
      .spyOn(service, 'executeCode')
      .mockImplementation(async (_code, _lang, stdin) => ({
        status: 'SUCCESS',
        stdout: `out:${stdin}`,
        stderr: '',
        compileError: null,
        executionTime: '0.01s',
        engine: 'wandbox',
      }));

    const results = await service.executeBatch('code', 'python', ['1', '2', '3']);
    expect(single).toHaveBeenCalledTimes(3);
    // Order is preserved.
    expect(results.map((r) => r.stdout)).toEqual(['out:1', 'out:2', 'out:3']);
  });

  it('splits more than 20 inputs into several batches', async () => {
    const tokens = (n: number, from: number) => Array.from({ length: n }, (_, i) => ({ token: `t${from + i}` }));
    const done = (n: number) => json({ submissions: Array.from({ length: n }, () => ({ status: { id: 3 }, stdout: b64('ok') })) });
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        const n = JSON.parse(String(init.body)).submissions.length;
        return json(tokens(n, n === 20 ? 0 : 20));
      }
      return done(url.includes('t20') ? 5 : 20);
    });

    const promise = service.executeBatch('code', 'cpp', Array.from({ length: 25 }, (_, i) => String(i)));
    await vi.advanceTimersByTimeAsync(1500);
    const results = await promise;
    const posts = fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST');
    expect(posts.map(([, init]) => JSON.parse(String(init.body)).submissions.length)).toEqual([20, 5]);
    expect(results).toHaveLength(25);
  });
});
