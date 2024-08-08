/**
 * A small, simple, order-agnostic router.
 */

type RouteResult<T> = {
  url: string;
  handler: T;
  params: Record<string, string>;
};

/**
 * Create a helper for buliding route definitions.
 */
export function makeRouteBuilder<T>() {
  const definitions: Record<string, T> = {};
  return {
    /**
     * Add a route to the builder.
     */
    add(pattern: string, def: T) {
      definitions[pattern] = def;
    },
    /**
     * Create the underlying route function used by the Router component
     * to match a URL to a route definition.
     */
    build: () => makeRouter(definitions),
  };
}

// 'hi/:name': 'a',
// 'order/:id/item/:itemNo': 'b',
// '*slug'
export function makeRouter<T>(routes: Record<string, T>) {
  const sanitizePathname = (s: string) => s.replace(/^\/+|\/+$|^https?:\/\/[^\/]+\/?/g, '');
  const rules = Object.keys(routes).reduce<Record<string, any>>((acc, rule) => {
    const value = routes[rule];
    const leaf = rule.split('/').reduce((node, piece) => {
      if (piece.startsWith(':') || piece.startsWith('*')) {
        const ch = piece[0];
        const name = piece.slice(1);
        const next = node[ch] || { name, children: {} };
        node[ch] = next;
        next.name = name;
        return next.children;
      }
      node[piece] = node[piece] || { name: '', children: {} };
      return node[piece].children;
    }, acc);
    leaf.value = value;
    return acc;
  }, {});

  const find = (node: any, i: number, pathname: string[], kvs: string[][]): any => {
    if (i >= pathname.length) {
      return node;
    }
    const piece = pathname[i];
    const exact = node[piece];
    if (exact) {
      const match = find(exact.children, i + 1, pathname, kvs);
      if (match) {
        return match;
      }
    }
    const named = node[':'];
    if (named) {
      const match = find(named.children, i + 1, pathname, kvs);
      if (match) {
        kvs.push([named.name, decodeURIComponent(piece)]);
        return match;
      }
    }
    const wildcard = node['*'];
    if (wildcard) {
      kvs.push([wildcard.name, pathname.slice(i).join('/')]);
      return wildcard.children;
    }
    return;
  };

  return (href: string): RouteResult<T> => {
    const [urlPathname, urlSearch] = href.split('?');
    const pathname = sanitizePathname(urlPathname).split('/');
    const kvs: string[][] = [];
    const match = find(rules, 0, pathname, kvs);

    if (!match) {
      throw new Error(`No route matches ${href}`);
    }

    const params = kvs.reduce<Record<string, string>>((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {});

    if (urlSearch) {
      urlSearch.split('&').forEach((searchParam) => {
        const [k, v] = searchParam.split('=');
        if (params[k] === undefined) {
          params[k] = decodeURIComponent(v);
        }
      });
    }

    return {
      handler: match.value,
      params,
      url: href,
    };
  };
}
