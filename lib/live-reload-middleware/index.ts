/**
 * This middleware provides live-reload functionality in dev-environments.
 * It intercepts any client requests made to a unique URL (endpointPath),
 * holding those connections open until a file change is detected.
 *
 * When we detect a file change, we'll respond to all connected clients,
 * sending them into refresh mode. They also go into refresh mode when
 * bun restarts (e.g. if running bun --watch, and making a change to a server
 * file).
 *
 * The hackiest part of this is the way we inject our live-reload script
 * into the head of all HTML responses.
 */

import type { Middleware } from 'lib/middleware';
import path from 'node:path';
import { watch } from 'fs';

/**
 * If running in dev-mode, watch the watchdirs folders for changes, and notify clients.
 */
export function makeLiveReloadMiddleware(opts: { watchdirs: string[] }): Middleware {
  // In non-dev environments, this middleware is a noop
  if (process.env.NODE_ENV !== 'development') {
    return (next) => next;
  }

  // An async function which will notify long-poll request handlers of file changes
  const waitForFileChange = makeFileWaiter(opts.watchdirs);

  // The endpoint for long-poll requests
  const endpointPath = '/livereload-0e4e2dfb-646b-4608-9943-ad3cad795856';

  // The script we'll inject to perform the long-poll from the browser
  const liveReloadScript = `<script>(${clientScript.toString()}("${endpointPath}"));</script>`;

  console.log(`[livereload] watching ${opts.watchdirs} for changes`);

  return function liveReloadMiddleware(next) {
    return async (req, server) => {
      // If our long-poll endpoint is being requested, we'll wait for a file
      // change, then we'll notify the client.
      if (req.url.endsWith(endpointPath)) {
        return new Response(await waitForFileChange(), {
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      // If it's not an HTML response, we'll just pass it along
      const result = await next(req, server);
      if (!result.headers.get('Content-Type')?.startsWith('text/html')) {
        return result;
      }

      // We have an HTML response, so we'll inject our live reload script
      const body = await result.text();
      return new Response(body.replace('</head>', `${liveReloadScript}</head>`), {
        headers: result.headers,
      });
    };
  };
}

/**
 * This is the client-side function. We'll stringify this and inject
 * it into any HTML payload that has a `</head>` tag.
 */
async function clientScript(endpointPath: string) {
  // Detect when the user is navigating away, in which case we don't
  // want to interfere by refreshing.
  let navigating = false;
  window.addEventListener('beforeunload', () => {
    navigating = true;
  });

  // Show a little "Reconnecting..." message when we've lost
  // the server connection.
  function showStatus() {
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; z-index: 10000; background: #800; padding: 2px 4px; text: white">
        Reconnecting...
      </div>
    `;
    document.body.append(el);
  }

  // Re-attempt the connection in a loop after which, refresh
  async function reconnect() {
    if (navigating) {
      return;
    }
    showStatus();
    let backoff = 10;
    for (let i = 0; i < 1000; ++i) {
      try {
        await fetch('/');
        break;
      } catch {
        await new Promise((r) => setTimeout(r, backoff));
        backoff = Math.min(backoff * 1.05, 500);
      }
    }
    !navigating && location.reload();
  }

  // Hit the middlware endpoint and wait for either a response or
  // a disconnect, sending us into the reconnect / refresh phase.
  fetch(endpointPath)
    .then((x) => x.text())
    .then(reconnect, reconnect);
}

// Make a function which can be used to wait for file changes in any
// of the specified directories.
function makeFileWaiter(watchdirs: string[]) {
  let reloadResolve: (s: string) => void;
  let reloadPromise: Promise<string>;

  const resetPromise = () => {
    reloadPromise = new Promise((resolve) => {
      reloadResolve = resolve;
    });
  };
  resetPromise();

  watchdirs.forEach((dir) => {
    watch(path.join(process.cwd(), dir), { recursive: true }, (_event, filename) => {
      const resolve = reloadResolve;
      resetPromise();
      resolve(filename || 'filechange');
    });
  });

  return () => reloadPromise;
}
