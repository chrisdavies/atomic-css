/**
 * Process a CSS file (and recursively process any of its simple imports).
 *
 * - Inline simple imports
 * - Extract Tailwind-like utility definitions from @layer utilities
 * - Expand Tailwind-like @apply directives
 */

import path from 'path';
import { readFileSync } from 'fs';
import { parseCSS, type TokenReader } from './css-parser';
import type { RuleLookupTable } from './rule-gen';

type Options = {
  /**
   * The CSS file being processed.
   */
  filename: string;

  /**
   * The base system CSS which will be injected wherever we first find "@layer base;".
   */
  baseLayer: string;

  /**
   * The rules we extract from @layer utilities { ... }, for example:
   * { 'p-4': { specificity: 0, css: 'padding: 1rem;' } }
   */
  rules: RuleLookupTable;
};

/**
 * Match basic import statements which can be inlined.
 */
const inlinableImport = /^@import ("\.(?:[^"\\]|\\.)+"|'\.(?:[^'\\]|\\.)+');$/;

/**
 * If the specified token is an `@apply` directive, return the expanded
 * CSS rather than the raw token.
 */
function expandApply(token: string, rules: RuleLookupTable) {
  const prefix = '@apply';
  if (!token.startsWith(prefix)) {
    return token;
  }
  const names = token.slice(prefix.length).match(/[\w-\/]+/g) || [];
  let result = '';
  for (const name of names) {
    result += rules.get(name)?.css || '';
  }
  return result;
}

/**
 * Read the next token, and throw an error if it isn't a "{"
 */
function assertOpeningBrace(r: TokenReader) {
  if (r.read() !== '{') {
    throw new Error(`Failed to read block: expected "{", got "${r.value}${r.read()}"`);
  }
}

/**
 * Read everything between the opening brace and its closing pair.
 *
 * .foo {
 *   color: red;
 *   &hover: {
 *     color: blue;
 *   }
 * }
 *
 * This returns:
 *
 *   color:red;
 *   &hover: {
 *     color: blue;
 *   }
 *
 */
function readBlock(r: TokenReader, rules: RuleLookupTable) {
  assertOpeningBrace(r);
  let result = '';
  let braces = 0;
  while (r.read()) {
    const token = expandApply(r.value, rules);
    if (token === '}') {
      --braces;
    }
    if (braces < 0) {
      break;
    }
    if (token === '{') {
      ++braces;
    }
    result += token;
  }
  return result;
}

/**
 * Extract all of the rules in the @layer utilities { ... } block, and add them
 * to the lookup table.
 */
function extractUtilitiesLayer(r: TokenReader, rules: RuleLookupTable) {
  assertOpeningBrace(r);
  let specificity = 0;
  while (r.read()) {
    const token = r.value;

    // This keeps our rules in declaration order
    // when we process the output, except in the
    // case of `@apply` which uses the order of
    // the @apply list instead.
    ++specificity;

    // We've read the closing layer bracket
    if (token === '}') {
      break;
    }

    const ruleName = token;
    if (!ruleName.startsWith('.')) {
      throw new Error(
        `Invalid @layer utilities class: "${ruleName}". Class names should start with a "."`,
      );
    }

    // Remove the leading `.` from the className
    // so, `.bg-4` becomes `bg-4` for lookup.
    rules.set(ruleName.slice(1), {
      specificity,
      css: readBlock(r, rules),
    });
  }
}

/**
 * Recursively load CSS files (inlining @import statements).
 */
function loadCSS(opts: Options & { filenames: string[] }) {
  const r = parseCSS(readFileSync(opts.filename, 'utf8'));
  let result = '';
  let base = opts.baseLayer;

  opts.filenames.push(opts.filename);

  while (r.read()) {
    const token = r.value;

    // Inject our base rules once, after which we'll ignore the base layer
    if (token === '@layer base;') {
      result += `@layer base {${base}}`;
      base = '';
      continue;
    }

    // Inline basic import statements
    if (token.startsWith('@import') && inlinableImport.test(token)) {
      // Get the string portion of the declaration
      const [_, escapedFilename] = token.match(inlinableImport)!;
      // Remove the surrounding quotes, and remove slashes from escape sequences
      const unescapedFilename = escapedFilename
        .slice(1, -1)
        .replaceAll(/\\./g, (ch) => ch.slice(-1));
      if (!unescapedFilename.endsWith('.css')) {
        result += token;
        continue;
      }
      const filename = path.join(path.dirname(opts.filename), unescapedFilename);
      result += `@layer {${loadCSS({ ...opts, filename, baseLayer: base })}}`;
      continue;
    }

    // Extract @layer utilities rules into the lookup table
    if (token === '@layer utilities') {
      extractUtilitiesLayer(r, opts.rules);
      continue;
    }

    result += expandApply(token, opts.rules);
  }
  return result;
}

export function makeCSSBuilder(opts: Options) {
  let filenames: string[] = [];
  let content = '';
  function update() {
    filenames = [];
    content = loadCSS({ ...opts, filenames });
  }
  update();
  return {
    update,
    get filenames() {
      return filenames;
    },
    toString() {
      return content;
    },
  };
}
