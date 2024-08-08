import { expect, describe, test } from 'bun:test';
import { makeRouter } from './index';

describe('makeRouter', () => {
  test('it is slash-agnostic', () => {
    const route = makeRouter({
      hello: 'a',
      world: 'b',
    });
    const tests = [
      ['hello', 'a'],
      ['world', 'b'],
      ['hello/', 'a'],
      ['world/', 'b'],
      ['https://this.example.com:300/hello/', 'a'],
    ];
    for (const [pathname, value] of tests) {
      expect(route(pathname)?.handler).toEqual(value);
    }
  });

  test('it returns params', () => {
    const route = makeRouter({
      'hi/:name': 'a',
      'order/:id/item/:itemNo': 'b',
    });
    const tests: Array<[string, Record<string, string>]> = [
      ['hi/fred', { name: 'fred' }],
      ['hi/jane?last=doe', { name: 'jane', last: 'doe' }],
      ['hi/jane?name=doe', { name: 'jane' }],
      ['order/o12/item/34', { id: 'o12', itemNo: '34' }],
      [`order/o12/item/${encodeURIComponent('h&l')}`, { id: 'o12', itemNo: 'h&l' }],
    ];
    for (const [pathname, params] of tests) {
      expect(route(pathname)?.params).toEqual(params);
    }
  });

  test('it respects specificity', () => {
    const route = makeRouter({
      'hi/:name': 'a',
      'hi/bob': 'b',
      'hi/bob/*slug': 'c',
      '*notFound': 'd',
    });
    const tests: Array<[string, string, Record<string, string>]> = [
      ['hi/fred', 'a', { name: 'fred' }],
      ['hi/bob', 'b', {}],
      ['hi/bob/and/friends', 'c', { slug: 'and/friends' }],
      ['goodbye/yall', 'd', { notFound: 'goodbye/yall' }],
    ];
    for (const [pathname, v, params] of tests) {
      const result = route(pathname);
      expect(result?.handler).toEqual(v);
      expect(result?.params).toEqual(params);
    }
  });

  test('it is fastish', () => {
    const route = makeRouter({
      'hi/:name': 'a',
      'hi/bob': 'b',
      'hi/bob/*slug': 'c',
      '*notFound': 'd',
    });
    const start = performance.now();
    const tests = ['hi/fred', 'hi/bob', 'hi/bob/and/friends', 'goodbye/yall'];
    for (let i = 0; i < 10000; ++i) {
      for (const [pathname] of tests) {
        if (!route(pathname)) {
          throw new Error(`Bad route ${pathname}`);
        }
      }
    }
    const end = performance.now();
    expect(end - start).toBeLessThan(50);
  });
});
