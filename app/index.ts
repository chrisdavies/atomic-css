import type { JSXResult } from 'lib/jsx';
import { makeRouteBuilder } from 'lib/router';

export type PageProps = Request & {
  params: Record<string, string>;
};

export type RouteResult = Response | JSXResult;

export type RouteHandler = (props: PageProps) => RouteResult | Promise<RouteResult>;

export const route = makeRouteBuilder<RouteHandler>();
