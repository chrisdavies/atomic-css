import type { Middleware } from 'lib/middleware';

/**
 * Convert milliseconds to [_ms] or [_ns].
 */
function humanTime(ms: number) {
  return ms < 1 ? `[~${Math.round(ms * 1000)}ns]` : `[${Math.round(ms)}ms]`;
}

/**
 * A simple middleware that logs how long a request took.
 */
export const requestElapsedLoggerMiddleware: Middleware = (next) => async (req, server) => {
  const now = performance.now();
  try {
    return await next(req, server);
  } finally {
    console.log(humanTime(performance.now() - now), req.method, req.url);
  }
};
