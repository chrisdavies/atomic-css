import type { Server } from 'bun';

// The Bun Serve.fetch handler singnature
export type HTTPHandler = (request: Request, server: Server) => Response | Promise<Response>;

// The type signature of a middleware function
export type Middleware = (next: HTTPHandler) => HTTPHandler;
