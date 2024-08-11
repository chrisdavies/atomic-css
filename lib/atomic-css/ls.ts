/**
 * A helper for recursively iterating through the source file contents of
 * one or more directories.
 */

import fs from 'fs';
import path from 'path';

type Options = {
  /**
   * The directories we want to scan.
   */
  directories: string[];
  /**
   * The paths we want to ignore (e.g. /node_modules|foo\/data/)
   */
  ignore?: RegExp;
  /**
   * The paths that we care about (e.g. /(\.html|\.jsx)^/)
   */
  match: RegExp;
};

/**
 * Recursively list the contents of the source files in the directories, yielding
 * any source code in files with the specified extensions. Ignores directories whose
 * path matches a value in options.ignore.
 *
 * Example:
 *
 * ls({ directories: ['.'], extensions: ['.ts', '.tsx'], ignore: ['node_modules'] });
 */
export function* ls(opts: Options): Generator<string> {
  for (const directory of opts.directories) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const pathname = path.join(directory, entry.name);
      if (opts.ignore?.test(pathname)) {
        continue;
      }
      if (entry.isDirectory()) {
        yield* ls({ ...opts, directories: [pathname] });
        continue;
      }
      if (entry.isFile() && opts.match.test(pathname)) {
        yield fs.readFileSync(pathname, 'utf8');
      }
    }
  }
}
