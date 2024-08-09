/**
 * This file contains logic for serving static assets out
 * of a folder. It is meant to be used in conjunction with
 * a router, rather than as traditional middleware.
 */
import path from 'node:path';

/**
 * Given a file, compoute its sha256 hash.
 */
async function computeFileSha256(filename: string) {
  const hasher = new Bun.CryptoHasher('sha256');
  const file = Bun.file(filename);
  const stream: any = file.stream();
  for await (const chunk of stream) {
    hasher.update(chunk);
  }
  return hasher.digest('base64');
}

/**
 * A memoized function which computes the sha256 hash of a file.
 * In dev-mode, we'll recompute the hash on each request. In
 * production, we'll cache it.
 */
const getEtag = (() => {
  if (process.env.NODE_ENV === 'development') {
    return computeFileSha256;
  }
  const cache: Record<string, string> = {};
  return async (filename: string) => {
    let hash = cache[filename];
    if (!hash) {
      hash = await computeFileSha256(filename);
      cache[filename] = hash;
    }
    return hash;
  };
})();

/**
 * Create a route-handler for serving static assets from a specific
 * folder. The route should define a "path" parameter, or the endpoint
 * will not work.
 *
 * Usage:
 *
 *   route.add('get/assets/*path', makeStaticAssetHandler('dist/img'));
 *   route.add('get/css/*path', makeStaticAssetHandler('dist/css'));
 */
export function makeStaticAssetHandler(folderPath: string) {
  return async (req: Request & { params: Record<string, string> }) => {
    // Compute the full path, normalizing out any .. and . segments
    const fullPath = path.normalize(path.join(folderPath, req.params.path));
    // We've got an invalid request, possibly someone malicious hunting for files
    if (!fullPath.startsWith(folderPath)) {
      return new Response('Invalid asset path', { status: 403 });
    }
    // Handle the 404 edge-case
    const file = Bun.file(fullPath);
    if (!(await file.exists())) {
      return new Response('File not found', { status: 404 });
    }
    // Compute the etag and send a 304 if the client already has the latest
    const etag = await getEtag(fullPath);
    if (etag === req.headers.get('If-None-Match')) {
      return new Response(null, { status: 304 });
    }
    return new Response(file, { headers: { ETag: etag } });
  };
}
