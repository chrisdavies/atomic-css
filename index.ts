import { route, type PageProps } from 'app';
import type { ErrorLike, Server } from 'bun';
import { html } from 'lib/jsx/html';
import { isJSXResult } from 'lib/jsx/jsx-runtime';
import './pages';

/**
 * The Bun Serve.fetch handler singnature
 */
export type HTTPHandler = (request: Request, server: Server) => Response | Promise<Response>;

/**
 * The type signature of a middleware function
 */
export type Middleware = (next: HTTPHandler) => HTTPHandler;

const routeRequest = route.build();

/**
 * Convert milliseconds to [_ms] or [_ns].
 */
function humanTime(ms: number) {
  return ms < 1 ? `[~${Math.round(ms * 1000)}ns]` : `[${Math.round(ms)}ms]`;
}

/**
 * A simple, fast URL parser that does only what we need.
 */
function parseUrl(url: string) {
  const protocolEnd = url.indexOf('//') + 2;
  let slash = url.indexOf('/', protocolEnd);
  if (slash < 0) {
    slash = url.length;
  }
  const colon = url.lastIndexOf(':', slash);
  const domain = url.slice(protocolEnd, colon > 0 ? colon : slash);
  const pathname = url.slice(slash + 1);
  return { domain, pathname };
}

/**
 * A simple middleware that logs how long a request took.
 */
const requestLogMiddleware: Middleware = (next) => async (req, server) => {
  const now = performance.now();
  try {
    return await next(req, server);
  } finally {
    console.log(humanTime(performance.now() - now), req.method, req.url);
  }
};

/**
 * The core HTTP handler which runs after all middleware.
 */
const handler = requestLogMiddleware(async (req) => {
  const url = parseUrl(req.url);
  const pattern = `${req.method.toLowerCase()}${url.pathname}`;
  const match = routeRequest(pattern);
  const pageProps = req as unknown as PageProps;
  pageProps.params = match.params;
  const result = await match.handler(pageProps);
  return isJSXResult(result) ? html(result) : result;
});

/**
 * The 500 error handler.
 */
const onError = (error: ErrorLike) => {
  if (process.env.NODE_ENV === 'development') {
    return new Response(`<pre>${Bun.escapeHTML(`${error}\n${error.stack}`)}</pre>`, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
  return new Response('Something went wrong...', { status: 500 });
};

/**
 * Start the server.
 */
const server = Bun.serve({
  port: process.env.PORT || 3000,
  fetch: handler,
  error: onError,
});

console.log(`Listening on localhost:${server.port}`);
