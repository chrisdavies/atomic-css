import { renderToString } from './index';

export const html = (content: any, opts?: ResponseInit) => {
  const output = renderToString(content);
  return new Response(output.startsWith('<html') ? `<!DOCTYPE html>${output}` : output, {
    ...opts,
    headers: { 'Content-Type': 'text/html', ...opts?.headers },
  });
};
