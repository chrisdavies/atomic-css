/**
 * A basic CSS parser. This is very rough and does not actually
 * understand the full CSS specification. It is inteded to cover
 * only those aspects of CSS which 1) I care about in my project
 * and 2) which the Tailwind-like processor is concerned with.
 */

/**
 * A reader interface that allows ieration of CSS tokens which
 * were parsed from the CSS source files. We are using an object
 * rather than a generator (or similar built-in) because it's
 * easier to pass around into sub-processors.
 */
export type TokenReader = {
  value: string;
  read(): string;
};

/**
 * Create a reader for extracting tokens from the specified CSS string.
 * This normalizes white space, handles string-literals, and strips
 * comments.
 */
export function parseCSS(css: string): TokenReader {
  // We'll be iterating through our CSS one character at a time.
  // This is the index of the current character.
  let i = 0;

  return {
    value: '',

    /**
     * Read the next token from the string.
     */
    read() {
      let result = '';
      while (i < css.length) {
        const ch = css[i];
        ++i;
        // Handle escape sequences
        if (ch === '\\') {
          result += ch;
          ++i;
          result += css[i];
          continue;
        }
        // Convert comments to white space
        if (ch === '/' && css[i] === '*') {
          result = appendNormalized(result, ' ');
          i = css.indexOf('*/', i);
          // If we didn't find a terminating sequence, we're done.
          // Otherwise, we'll skip past the "*/".
          i = i < 0 ? css.length : i + 2;
          continue;
        }
        // Read string literals
        if (ch === `'` || ch === `"`) {
          const start = i - 1;
          while (i < css.length && css[i] !== ch) {
            // Skip past escape sequences
            i += css[i] === '\\' ? 2 : 1;
          }
          ++i;
          result += css.slice(start, i);
          continue;
        }
        // We've hit the end of a statement
        if (ch === ';') {
          result += ch;
          break;
        }
        // We've hit the start / end of a block
        if (ch === '{' || ch === '}') {
          // If we have a preceding token, we want to return that
          // so we decrement in order to read the bracket on the
          // subsequent read. This happens in the ".foo {" scenario
          // or in the case of an unterminated statement like " color: red }"
          if (result.trim()) {
            --i;
          } else {
            result = ch;
          }
          break;
        }
        // This isn't a special char, so just append it.
        result = appendNormalized(result, ch);
      }
      this.value = result.trim();
      return this.value;
    },
  };
}

/**
 * Append ch to result if it doesn't result in multiple white spaces.
 * If ch is a white space, convert it to ' '.
 */
function appendNormalized(result: string, ch: string) {
  const hasTrailingSpace = (ch: string) => /\s$/.test(ch);
  if (!hasTrailingSpace(ch)) {
    return result + ch;
  } else if (!hasTrailingSpace(result)) {
    return result + ' ';
  }
  return result;
}
