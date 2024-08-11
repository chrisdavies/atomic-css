import { expect, describe, test } from 'bun:test';
import { parseCSS } from './css-parser';

describe('parseCSS', () => {
  function expectTokens(css: string, tokens: string[]) {
    const r = parseCSS(css);
    const actual: string[] = [];
    while (true) {
      const token = r.read();
      if (!token) {
        break;
      }
      actual.push(token);
    }
    expect(actual).toEqual(tokens);
  }

  test('tokenizer ignores comments', () => {
    expectTokens('/* a */b;/* c */d;', ['b;', 'd;']);
  });

  test('it handles strings', () => {
    expectTokens(`.foo { content: "'/**/{}\\""; }`, ['.foo', '{', `content: "'/**/{}\\"";`, '}']);
    expectTokens(`.foo { content: '/**/{  }\\'"'; }`, [
      '.foo',
      '{',
      `content: '/**/{  }\\'"';`,
      '}',
    ]);
  });

  test('tokenizer handles blocks', () => {
    expectTokens('@tailwind base;\n.foo {\n  color: red;\n}\n', [
      '@tailwind base;',
      '.foo',
      '{',
      'color: red;',
      '}',
    ]);
  });

  test('tokenizer handles unclosed comments', () => {
    expectTokens('.foo /* bar', ['.foo']);
  });

  test('tokenizer handles missing trailing semicolons', () => {
    expectTokens('.foo{color: red}', ['.foo', '{', 'color: red', '}']);
  });

  test('tokenizer converts comments to whitespace', () => {
    expectTokens('.bar/* hi */{border: 2px/**/solid; }', ['.bar', '{', 'border: 2px solid;', '}']);
  });

  test('it normalizes insignificant whitespace', () => {
    expectTokens(`@tailwind   base;`, [`@tailwind base;`]);
    expectTokens(`@tailwind\nbase;`, [`@tailwind base;`]);
    expectTokens(`.border { border: 2px solid red; }`, [
      '.border',
      '{',
      'border: 2px solid red;',
      '}',
    ]);
  });
});
