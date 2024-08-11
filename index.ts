import { route, type PageProps } from 'app';
import type { ErrorLike } from 'bun';
import { html } from 'lib/jsx/html';
import { isJSXResult } from 'lib/jsx/jsx-runtime';
import './pages';
import { makeLiveReloadMiddleware } from 'lib/live-reload-middleware';
import { requestElapsedLoggerMiddleware } from 'lib/request-log-middleware';
import { makeStaticAssetHandler } from 'lib/static-assets';

// Serve static assets from both ./css and ./dist
route.add('get/css/*path', makeStaticAssetHandler('css'));
route.add('get/dist/*path', makeStaticAssetHandler('dist'));

const routeRequest = route.build();
const liveReloadMiddleware = makeLiveReloadMiddleware({ watchdirs: ['dist'] });

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
  const pathname = url.slice(slash);
  return { domain, pathname };
}

/**
 * The core HTTP handler which runs after all middleware.
 */
const handler = liveReloadMiddleware(
  requestElapsedLoggerMiddleware(async (req) => {
    const url = parseUrl(req.url);
    const pattern = `${req.method.toLowerCase()}${url.pathname}`;
    const match = routeRequest(pattern);
    const pageProps = req as unknown as PageProps;
    pageProps.params = match.params;
    const result = await match.handler(pageProps);
    return isJSXResult(result) ? html(result) : result;
  }),
);

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
