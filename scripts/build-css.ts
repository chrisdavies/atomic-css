/**
 * Start the app in dev mode.
 */

import { writeCSS } from 'lib/atomic-css';

await writeCSS({
  cssFile: 'css/index.css',
  ignore: /node_modules/,
  sourceDirectories: ['pages', 'components'],
  outfile: 'dist/index.css',
});
