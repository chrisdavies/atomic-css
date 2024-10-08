import { expect, describe, test } from 'bun:test';
import { makeCSSBuilder } from './css-processor';
import * as fs from 'fs';
import { type Rule } from './rule-gen';

describe('css-builder', () => {
  function testCSSBuilder(filename: string, files: Record<string, string>) {
    const dir = fs.mkdtempSync('test');
    try {
      for (const filename in files) {
        fs.writeFileSync(filename, files[filename], 'utf8');
      }
      const rules: Record<string, Rule> = {
        'bg-blue': { specificity: 0, css: 'background: blue;' },
        'bg-blue-600/50': { specificity: 0, css: 'background: lightblue;' },
        'text-yellow': { specificity: 0, css: 'color: yellow;' },
      };
      return makeCSSBuilder({
        filename,
        baseLayer: `.base{content: 'no treble'}`,
        rules: {
          get: (name) => rules[name],
          set: (name, rule) => {
            rules[name] = rule;
          },
        },
      }).toString();
    } finally {
      fs.rmdirSync(dir, { recursive: true });
    }
  }

  test('it compacts whitespace', () => {
    const files = {
      'index.css': `
      /* Hey! */
      .u {
        color:/**/red;
      }

      .sa {
        background: white; /* Comments, too! */
        border-color: blue;
      }
    `,
    };
    const actual = testCSSBuilder('index.css', files);
    const expected = `.u{color: red;}.sa{background: white;border-color: blue;}`;
    expect(actual).toEqual(expected);
  });

  test('it replaces @layer base;', () => {
    const files = {
      'index.css': `
        @layer base;
        .foo {
          content: 'bar';
        }
      `,
    };
    const actual = testCSSBuilder('index.css', files);
    const expected = `@layer base {.base{content: 'no treble'}}.foo{content: 'bar';}`;
    expect(actual).toEqual(expected);
  });

  test('it expands @apply directives', () => {
    const files = {
      'index.css': `
        .foo {
          @apply bg-blue-600/50 text-yellow;
        }
      `,
    };
    const actual = testCSSBuilder('index.css', files);
    const expected = `.foo{background: lightblue;color: yellow;}`;
    expect(actual).toEqual(expected);
  });

  test('it inlines @imports', () => {
    const files = {
      'index.css': `
        @import "./base.css";
        @import "./utils.css";
        .foo {
          content: 'bar';
        }
      `,
      'base.css': `
        :root {
          background: black;
        }
      `,
      'utils.css': `
        .bg-red {
          background: red;
        }
      `,
    };
    const actual = testCSSBuilder('index.css', files);
    const expected = [
      `@layer {:root{background: black;}}`,
      `@layer {.bg-red{background: red;}}`,
      `.foo{content: 'bar';}`,
    ].join('');
    expect(actual).toEqual(expected);
  });

  test('it extracts @layer utilities rules', () => {
    const files = {
      'index.css': `
        @layer utilities {
          .neon {
            color: pink;
          }
          .bright {
            background: yellow;
          }
        }
        .foo {
          @apply neon bright;
        }
      `,
    };
    const actual = testCSSBuilder('index.css', files);
    const expected = `.foo{color: pink;background: yellow;}`;
    expect(actual).toEqual(expected);
  });
});
