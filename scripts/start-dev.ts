/**
 * Start the app in dev mode.
 */

import { $ } from 'bun';
import { writeCSS } from 'lib/atomic-css';

await Promise.all([
  writeCSS({
    cssFile: 'css/index.css',
    ignore: /node_modules/,
    sourceDirectories: ['pages', 'components'],
    outfile: 'dist/index.css',
    watch: true,
  }),

  $`NODE_ENV=development bun --watch index.ts`,
]);
