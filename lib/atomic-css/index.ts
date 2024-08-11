/**
 * The public API for the atomic-css library. There are two
 * supported functions:
 *
 * - `stringifyCSS` for generating a string
 * - `writeCSS` for generating a file
 *
 * writeCSS supports an optional watch mode, and thus is an
 * async function.
 */

import preflight from './preflight.css' with { type: 'text' };
import fs from 'fs';
import path from 'path';
import { compileConfig, type Config } from './config';
import { makeCSSBuilder } from './css-processor';
import { makeUtilitiesLayerBuilder } from './layer-builder';
import { ls } from './ls';
import { configToRules } from './rule-gen';

type BaseOptions = {
  sourceDirectories: string[];
  cssFile: string;
  ignore?: RegExp;
  match?: RegExp;
  config?: Config;
};

type WriteOptions = BaseOptions & {
  outfile: string;
  watch?: boolean;
};

const defaultMatch = /(\.tsx|\.ts|\.jsx|\.js|\.html)$/;
const baseLayer = `@layer base {${preflight}} @layer components, utilities;`;

function makeBuildContext(opts: BaseOptions) {
  const match = opts.match || defaultMatch;
  const config = compileConfig(opts.config);
  const rules = configToRules(config);

  const cssBuilder = makeCSSBuilder({
    filename: opts.cssFile,
    rules,
    baseLayer,
  });

  const utilityBuilder = makeUtilitiesLayerBuilder({
    rules,
    breakpoints: config.breakpoint,
  });

  utilityBuilder.update(
    ls({
      directories: opts.sourceDirectories,
      match,
    }),
  );

  return {
    match,
    cssBuilder,
    utilityBuilder,
    toString() {
      return cssBuilder.toString() + utilityBuilder.toString();
    },
  };
}

function watchAll(
  paths: string[],
  opts: { recursive?: boolean },
  callback: (filename: string) => void,
) {
  const makeWatcher = (filename: string) =>
    fs.watch(filename, opts, (_, name) => {
      if (name && !name.endsWith('~')) {
        const fullPath = opts.recursive ? path.join(filename, name) : name;
        callback(fullPath);
      }
    });
  const watchers = paths.map(makeWatcher);
  return {
    addFiles(newPaths: string[]) {
      for (const path of newPaths) {
        if (paths.includes(path)) {
          continue;
        }
        paths.push(path);
        watchers.push(makeWatcher(path));
      }
    },
    close() {
      watchers.forEach((w) => w.close());
    },
  };
}

function logChange(filename: string, handler: () => void) {
  const start = performance.now();
  console.log(`[atomic-css] file changed "${filename}"`);
  handler();
  console.log(`[atomic-css] rebuilt in ${performance.now() - start}ms`);
}

export function stringifyCSS(opts: BaseOptions) {
  return makeBuildContext(opts).toString();
}

export function writeCSS(opts: WriteOptions) {
  let ctx = makeBuildContext(opts);

  const writeCSS = () => {
    fs.mkdirSync(path.dirname(opts.outfile), { recursive: true });
    fs.writeFileSync(opts.outfile, ctx.toString(), 'utf8');
  };

  writeCSS();

  if (!opts.watch) {
    return;
  }

  const cssWatcher = watchAll(ctx.cssBuilder.filenames, {}, function onChange(filename) {
    logChange(filename, () => {
      // When our CSS changes, we need to do a full rebuild, as we may have had
      // fundamental changes (utility rules may have been overwritten, modified, or
      // removed).
      ctx = makeBuildContext(opts);
      writeCSS();
      cssWatcher.addFiles(ctx.cssBuilder.filenames);
    });
  });

  const sourceWatcher = watchAll(opts.sourceDirectories, { recursive: true }, (filename) => {
    if (!opts.ignore?.test(filename) && ctx.match.test(filename)) {
      logChange(filename, () => {
        ctx.utilityBuilder.update([fs.readFileSync(filename, 'utf8')]);
        writeCSS();
      });
    }
  });

  console.log(`[atomic-css] waiting for changes...`);
  return new Promise((resolve) => {
    process.on('SIGINT', () => {
      // Close watchers when Ctrl-C is pressed
      console.log('[atomic-css][sigint] closing watchers...');
      cssWatcher.close();
      sourceWatcher.close();
      resolve(undefined);
    });
  });
}
