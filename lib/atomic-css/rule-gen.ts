/**
 * This module contains the logic for converting configuration
 * into concrete rule definitions. As a simplified example, it
 * takes something like this config:
 *
 *   { color: { white: '#fff' } }
 *
 * And produces something like this lookup table:
 *
 *   {
 *     'text-white': { css: 'color: #fff' },
 *     'bg-white': { background-color: 'color: #fff' },
 *
 *     etc..
 *   }
 */
import { type Config } from './config';

/**
 * A utility rule definition.
 */
export type Rule = {
  /**
   * We'll sort rules by specificity from low to high
   * before writing them to our final CSS.
   */
  specificity: number;
  /**
   * If specified, this is tacked on to the final selector. For example,
   * space-x-* rules have this suffix:
   *
   *    > :not([hidden]) ~ :not([hidden])
   *
   * And will end up with a selector like:
   *
   *   .space-x-2 > :not([hidden]) ~ :not([hidden])
   */
  suffix?: string;
  /**
   * If specified, this is a standalone rule which will be written out
   * as a sibling to the rule it's associated with. It's currently only
   * used to ensure `@keyframe` values are written when an animation rule
   * is applied.
   */
  sibling?: string;
  /**
   * Raw CSS declarations, e.g. "color: red;"
   */
  css: string;
};

/**
 * A map of rule name to Rule definition, e.g. { 'p-8': { specificity, css } }
 */
export type RuleLookupTable = {
  get(name: string): Rule | undefined;
  set(name: string, rule: Rule): void;
};

/**
 * A helper for adding a simple rule to the lookup table.
 */
function addRule(rules: RuleLookupTable, name: string, css: string, specificity = 0) {
  rules.set(name, { specificity, css });
}

/**
 * Convert our "r g b" strings to working rgb(r g b) form.
 */
function toColorLiteral(s: string) {
  return s.indexOf(' ') > 0 ? `rgb(${s})` : s;
}

/**
 * A helper function for generating rules from the color palette.
 */
function genColors(
  rules: RuleLookupTable,
  colors: Record<string, string>,
  prefix: string,
  prop: string | ((color: string) => string),
  specificity = 0,
) {
  const propFn = typeof prop === 'string' ? (color: string) => `${prop}: ${color};` : prop;

  for (const k in colors) {
    const v = colors[k];

    // The indexOf is a hacky way to check if we've got an rgb value vs something like "currentColor"
    const color = v.indexOf(' ') > 0 ? `rgb(${v} / var(--tw-${prefix}-opacity))` : v;

    // Example:
    // Name: text-green-600
    // css: `--tw-text-opacity: 1; color: rgb(22 163 74 / var(--tw-bg-opacity));
    rules.set(`${prefix}-${k}`, {
      specificity,
      css: `--tw-${prefix}-opacity: 1; ${propFn(color)}`,
    });

    // Gneerate all of the /opacity variants (e.g. "text-green-600/20" or "text-opacity-20")
    for (let i = 0; i <= 100; i += 5) {
      const opacity = i / 100;
      rules.set(`${prefix}-${k}/${i}`, {
        specificity: specificity + 1,
        css: propFn(`rgb(${v} / ${opacity})`),
      });
      rules.set(`${prefix}-opacity-${i}`, {
        specificity: specificity + 2,
        css: `--tw-${prefix}-opacity: ${opacity};`,
      });
    }
  }
}

/**
 * Make a lookup table. We're putting the lookup table behind a custom type
 * rather than exposing the Record<string, Rule> directly so that we can
 * expand the "get" to do expensive generative rules in the future if we
 * want (e.g. we may decide not to eagerly generate the opacity variants `/50`
 * and instead lazily generate them when get is called on such a rule).
 */
function makeLookupTable(): RuleLookupTable {
  const rules: Record<string, Rule> = {};
  return {
    get(name) {
      return rules[name];
    },
    set(name, rule) {
      rules[name] = rule;
    },
  };
}

// prettier-ignore
/**
 * Generate the lookup table from the specified config.
 */
export function configToRules(config: Config) {
  const rules = makeLookupTable();

  addRule(rules, 'animate-none',        'animation: none;');

  addRule(rules, 'italic',              'font-style: italic;');
  addRule(rules, 'not-italic',          'font-style: normal;');

  addRule(rules, 'font-thin',           'font-weight: 100;');
  addRule(rules, 'font-extralight',     'font-weight: 200;');
  addRule(rules, 'font-light',          'font-weight: 300;');
  addRule(rules, 'font-normal',         'font-weight: 400;');
  addRule(rules, 'font-medium',         'font-weight: 500;');
  addRule(rules, 'font-semibold',       'font-weight: 600;');
  addRule(rules, 'font-bold',           'font-weight: 700;');
  addRule(rules, 'font-extrabold',      'font-weight: 800;');
  addRule(rules, 'font-black',          'font-weight: 900;');

  addRule(rules, 'uppercase',           'text-transform: uppercase;');
  addRule(rules, 'lowercase',           'text-transform: lowercase;');
  addRule(rules, 'capitalize',          'text-transform: capitalize;');
  addRule(rules, 'normal-case',         'text-transform: none;');

  addRule(rules, 'static',              'position: static;');
  addRule(rules, 'fixed',               'position: fixed;');
  addRule(rules, 'absolute',            'position: absolute;');
  addRule(rules, 'relative',            'position: relative;');
  addRule(rules, 'sticky',              'position: sticky;');

  addRule(rules, 'visible',             'visibility: visible;');
  addRule(rules, 'invisible',           'visibility: hidden;');
  addRule(rules, 'collapse',            'visibility: collapse;');

  addRule(rules, 'block',               'display: block;');
  addRule(rules, 'inline-block',        'display: inline-block;');
  addRule(rules, 'inline',              'display: inline;');
  addRule(rules, 'flex',                'display: flex;');
  addRule(rules, 'inline-flex',         'display: inline-flex;');
  addRule(rules, 'table',               'display: table;');
  addRule(rules, 'inline-table',        'display: inline-table;');
  addRule(rules, 'table-caption',       'display: table-caption;');
  addRule(rules, 'table-cell',          'display: table-cell;');
  addRule(rules, 'table-column',        'display: table-column;');
  addRule(rules, 'table-column-group',  'display: table-column-group;');
  addRule(rules, 'table-footer-group',  'display: table-footer-group;');
  addRule(rules, 'table-header-group',  'display: table-header-group;');
  addRule(rules, 'table-row-group',     'display: table-row-group;');
  addRule(rules, 'table-row',           'display: table-row;');
  addRule(rules, 'flow-root',           'display: flow-root;');
  addRule(rules, 'grid',                'display: grid;');
  addRule(rules, 'inline-grid',         'display: inline-grid;');
  addRule(rules, 'contents',            'display: contents;');
  addRule(rules, 'list-item',           'display: list-item;');
  addRule(rules, 'hidden',              'display: none;', 1);
  addRule(rules, 'grow',                'flex-grow: 1;');
  addRule(rules, 'grow-0',              'flex-grow: 0;', 1);

  addRule(rules, 'flex-row',            'flex-direction: row;');
  addRule(rules, 'flex-col',            'flex-direction: column;');
  addRule(rules, 'justify-normal',      'justify-content: normal;');
  addRule(rules, 'justify-start',       'justify-content: flex-start;');
  addRule(rules, 'justify-end',         'justify-content: flex-end;');
  addRule(rules, 'justify-center',      'justify-content: center;');
  addRule(rules, 'justify-between',     'justify-content: space-between;');
  addRule(rules, 'justify-around',      'justify-content: space-around;');
  addRule(rules, 'justify-evenly',      'justify-content: space-evenly;');
  addRule(rules, 'justify-stretch',     'justify-content: stretch;');
  addRule(rules, 'items-start',         'align-items: flex-start;');
  addRule(rules, 'items-end',           'align-items: flex-end;');
  addRule(rules, 'items-center',        'align-items: center;');
  addRule(rules, 'items-baseline',      'align-items: baseline;');
  addRule(rules, 'items-stretch',       'align-items: stretch;');

  addRule(rules, 'auto-cols-auto',      'grid-auto-columns: auto;');
  addRule(rules, 'auto-cols-min',       'grid-auto-columns: min-content;');
  addRule(rules, 'auto-cols-max',       'grid-auto-columns: max-content;');
  addRule(rules, 'auto-cols-fr',        'grid-auto-columns: minmax(0, 1fr);');
  addRule(rules, 'auto-rows-auto',      'grid-auto-rows: auto;');
  addRule(rules, 'auto-rows-min',       'grid-auto-rows: min-content;');
  addRule(rules, 'auto-rows-max',       'grid-auto-rows: max-content;');
  addRule(rules, 'auto-rows-fr',        'grid-auto-rows: minmax(0, 1fr);');

  addRule(rules, 'grid-cols-none',      'grid-template-columns: none;');
  addRule(rules, 'grid-cols-subgrid',   'grid-template-columns: subgrid;');
  addRule(rules, 'grid-rows-none',      'grid-template-rows: none;');
  addRule(rules, 'grid-rows-subgrid',   'grid-template-rows: subgrid;');

  addRule(rules, 'col-span-full',       'grid-column: 1 / -1;');
  addRule(rules, 'row-span-full',       'grid-row: 1 / -1;');
  addRule(rules, 'grid-flow-row',       'grid-auto-flow: row;');
  addRule(rules, 'grid-flow-col',       'grid-auto-flow: column;');
  addRule(rules, 'grid-flow-dense',     'grid-auto-flow: dense;');
  addRule(rules, 'grid-flow-row-dense', 'grid-auto-flow: row dense;');
  addRule(rules, 'grid-flow-col-dense', 'grid-auto-flow: column dense;');
  addRule(rules, 'col-auto',            'grid-column: auto;');
  addRule(rules, 'row-auto',            'grid-row: auto;');
  addRule(rules, 'col-start-auto',      'grid-column-start: auto;');
  addRule(rules, 'row-start-auto',      'grid-row-start: auto;');
  addRule(rules, 'col-end-auto',        'grid-column-end: auto;');
  addRule(rules, 'row-end-auto',        'grid-row-end: auto;');

  addRule(rules, 'origin-center',       'transform-origin: center;');
  addRule(rules, 'origin-top',          'transform-origin: top;');
  addRule(rules, 'origin-top-right',    'transform-origin: top right;');
  addRule(rules, 'origin-right',        'transform-origin: right;');
  addRule(rules, 'origin-bottom-right', 'transform-origin: bottom right;');
  addRule(rules, 'origin-bottom',       'transform-origin: bottom;');
  addRule(rules, 'origin-bottom-left',  'transform-origin: bottom left;');
  addRule(rules, 'origin-left',         'transform-origin: left;');
  addRule(rules, 'origin-top-left',     'transform-origin: top left;');

  addRule(rules, 'outline-none',        'outline: 2px solid transparent;outline-offset: 2px;', 2);
  addRule(rules, 'outline',             'outline-style: solid;', 1);
  addRule(rules, 'outline-dashed',      'outline-style: dashed;', 1);
  addRule(rules, 'outline-dotted',      'outline-style: dotted;', 1);
  addRule(rules, 'outline-double',      'outline-style: double;', 1);
  addRule(rules, 'outline-0',           'outline-width: 0px;', 1);
  addRule(rules, 'outline-1',           'outline-width: 1px;', 1);
  addRule(rules, 'outline-2',           'outline-width: 2px;', 1);
  addRule(rules, 'outline-4',           'outline-width: 4px;', 1);
  addRule(rules, 'outline-8',           'outline-width: 8px;', 1);
  addRule(rules, 'outline-inherit',     'outline-color: inherit;', 1);
  addRule(rules, 'outline-current',     'outline-color: currentColor;', 1);
  addRule(rules, 'outline-transparent', 'outline-color: transparent;', 1);
  addRule(rules, 'outline-offset-0',    'outline-offset: 0px;');
  addRule(rules, 'outline-offset-1',    'outline-offset: 1px;');
  addRule(rules, 'outline-offset-2',    'outline-offset: 2px;');
  addRule(rules, 'outline-offset-4',    'outline-offset: 4px;');
  addRule(rules, 'outline-offset-8',    'outline-offset: 8px;');

  addRule(rules, 'overflow-auto',       'overflow: auto;');
  addRule(rules, 'overflow-hidden',     'overflow: hidden;');
  addRule(rules, 'overflow-clip',       'overflow: clip;');
  addRule(rules, 'overflow-visible',    'overflow: visible;');
  addRule(rules, 'overflow-scroll',     'overflow: scroll;');
  addRule(rules, 'overflow-x-auto',     'overflow-x: auto;',    1);
  addRule(rules, 'overflow-x-hidden',   'overflow-x: hidden;',  1);
  addRule(rules, 'overflow-x-clip',     'overflow-x: clip;',    1);
  addRule(rules, 'overflow-x-visible',  'overflow-x: visible;', 1);
  addRule(rules, 'overflow-x-scroll',   'overflow-x: scroll;',  1);
  addRule(rules, 'overflow-y-auto',     'overflow-y: auto;',    1);
  addRule(rules, 'overflow-y-hidden',   'overflow-y: hidden;',  1);
  addRule(rules, 'overflow-y-clip',     'overflow-y: clip;',    1);
  addRule(rules, 'overflow-y-visible',  'overflow-y: visible;', 1);
  addRule(rules, 'overflow-y-scroll',   'overflow-y: scroll;',  1);

  addRule(rules, 'border-solid',        'border-style: solid;');
  addRule(rules, 'border-dashed',       'border-style: dashed;');
  addRule(rules, 'border-dotted',       'border-style: dotted;');
  addRule(rules, 'border-double',       'border-style: double;');
  addRule(rules, 'border-hidden',       'border-style: hidden;');
  addRule(rules, 'border-none',         'border-style: none;');

  addRule(rules, 'bg-clip-border',      'background-clip: border-box;');
  addRule(rules, 'bg-clip-padding',     'background-clip: padding-box;');
  addRule(rules, 'bg-clip-content',     'background-clip: content-box;');
  addRule(rules, 'bg-clip-text',        'background-clip: text;');

  addRule(rules, 'aspect-auto',         'aspect-ratio: auto;', 1);
  addRule(rules, 'aspect-square',       'aspect-ratio: 1 / 1;');
  addRule(rules, 'aspect-video',        'aspect-ratio: 16 / 9;');

  addRule(rules, 'box-border',          'box-sizing: border-box;');
  addRule(rules, 'box-content',         'box-sizing: content-box;');

  addRule(rules, 'underline',           'text-decoration-line: underline;');
  addRule(rules, 'overline',            'text-decoration-line: overline;');
  addRule(rules, 'line-through',        'text-decoration-line: line-through;');
  addRule(rules, 'no-underline',        'text-decoration-line: none;');
  addRule(rules, 'decoration-solid',    'text-decoration-style: solid;');
  addRule(rules, 'decoration-double',   'text-decoration-style: double;');
  addRule(rules, 'decoration-dotted',   'text-decoration-style: dotted;');
  addRule(rules, 'decoration-dashed',   'text-decoration-style: dashed;');
  addRule(rules, 'decoration-wavy',     'text-decoration-style: wavy;');
  addRule(rules, 'decoration-auto',     'text-decoration-thickness: auto;');
  addRule(rules, 'decoration-from-font','text-decoration-thickness: from-font;');
  addRule(rules, 'decoration-0',        'text-decoration-thickness: 0px;');
  addRule(rules, 'decoration-1',        'text-decoration-thickness: 1px;');
  addRule(rules, 'decoration-2',        'text-decoration-thickness: 2px;');
  addRule(rules, 'decoration-4',        'text-decoration-thickness: 4px;');
  addRule(rules, 'decoration-8',        'text-decoration-thickness: 8px;');
  addRule(rules, 'underline-offset-auto', 'text-underline-offset: auto;');
  addRule(rules, 'underline-offset-0',  'text-underline-offset: 0px;');
  addRule(rules, 'underline-offset-1',  'text-underline-offset: 1px;');
  addRule(rules, 'underline-offset-2',  'text-underline-offset: 2px;');
  addRule(rules, 'underline-offset-4',  'text-underline-offset: 4px;');
  addRule(rules, 'underline-offset-8',  'text-underline-offset: 8px;');

  addRule(rules, 'break-normal',        'overflow-wrap: normal;word-break: normal;');
  addRule(rules, 'break-words',         'overflow-wrap: break-word;');
  addRule(rules, 'break-all',           'word-break: break-all;');
  addRule(rules, 'break-keep',          'word-break: keep-all;');
  addRule(rules, 'text-wrap',           'text-wrap: wrap;');
  addRule(rules, 'text-nowrap',         'text-wrap: nowrap;');
  addRule(rules, 'text-balance',        'text-wrap: balance;');
  addRule(rules, 'text-pretty',         'text-wrap: pretty;');
  addRule(rules, 'truncate',            'overflow: hidden;text-overflow: ellipsis;white-space: nowrap;', 1);
  addRule(rules, 'text-ellipsis',       'text-overflow: ellipsis;');
  addRule(rules, 'text-clip',           'text-overflow: clip;');

  addRule(rules, 'z-0',                 'z-index: 0;');
  addRule(rules, 'z-10',                'z-index: 10;');
  addRule(rules, 'z-20',                'z-index: 20;');
  addRule(rules, 'z-30',                'z-index: 30;');
  addRule(rules, 'z-40',                'z-index: 40;');
  addRule(rules, 'z-50',                'z-index: 50;');
  addRule(rules, 'z-auto',              'z-index: auto;');

  addRule(rules, 'text-left',           'text-align: left;');
  addRule(rules, 'text-center',         'text-align: center;');
  addRule(rules, 'text-right',          'text-align: right;');
  addRule(rules, 'text-justify',        'text-align: justify;');
  addRule(rules, 'text-start',          'text-align: start;');
  addRule(rules, 'text-end',            'text-align: end;');

  const transform = [
    'transform:',
    'translate(var(--tw-translate-x), var(--tw-translate-y))',
    'rotate(var(--tw-rotate))',
    'skewX(var(--tw-skew-x))',
    'skewY(var(--tw-skew-y))',
    'scaleX(var(--tw-scale-x))',
    'scaleY(var(--tw-scale-y))'
  ].join(' ');

  addRule(rules, 'rotate-0',            `--tw-rotate: 0deg;${transform};`);
  addRule(rules, 'rotate-1',            `--tw-rotate: 1deg;${transform};`);
  addRule(rules, 'rotate-2',            `--tw-rotate: 2deg;${transform};`);
  addRule(rules, 'rotate-3',            `--tw-rotate: 3deg;${transform};`);
  addRule(rules, 'rotate-6',            `--tw-rotate: 6deg;${transform};`);
  addRule(rules, 'rotate-12',           `--tw-rotate: 12deg;${transform};`);
  addRule(rules, 'rotate-45',           `--tw-rotate: 45deg;${transform};`);
  addRule(rules, 'rotate-180',          `--tw-rotate: 180deg;${transform};`);

  addRule(rules, 'whitespace-normal',         'white-space: normal;');
  addRule(rules, 'whitespace-nowrap',         'white-space: nowrap;');
  addRule(rules, 'whitespace-pre',            'white-space: pre;');
  addRule(rules, 'whitespace-pre-line',       'white-space: pre-line;');
  addRule(rules, 'whitespace-pre-wrap',       'white-space: pre-wrap;');
  addRule(rules, 'whitespace-break-spaces',   'white-space: break-spaces;');

  genColors(rules, config.color, 'outline',   'outline-color');
  genColors(rules, config.color, 'text',      'color');
  genColors(rules, config.color, 'decoration','text-decoration-color');
  genColors(rules, config.color, 'bg',        'background-color');
  genColors(rules, config.color, 'border',    'border-color');
  genColors(rules, config.color, 'accent',    'accent-color',       2);
  genColors(rules, config.color, 'border-l',  'border-left-color',  2);
  genColors(rules, config.color, 'border-r',  'border-right-color', 2);
  genColors(rules, config.color, 'border-t',  'border-top-color',   2);
  genColors(rules, config.color, 'border-b',  'border-bottom-color',2);

  genColors(
    rules,
    config.color,
    `border-x`,
    (color) => `border-left-color: ${color}; border-right-color: ${color};`,
    1,
  );
  genColors(
    rules,
    config.color,
    `border-y`,
    (color) => `border-top-color: ${color}; border-bottom-color: ${color};`,
    1,
  );
  genColors(
    rules,
    config.color,
    `shadow`,
    (color) => `--tw-shadow-color: ${color}; --tw-shadow: var(--tw-shadow-colored);`,
    1,
  );

  for (const k in config.fontSize) {
    const [sz, h] = config.fontSize[k];
    addRule(rules, `text-${k}`,         `font-size: ${sz};line-height: ${h};`);
  }

  for (const k in config.fontFamily) {
    addRule(rules, `font-${k}`,         `font-family: ${config.fontFamily[k]};`);
  }

  for (const k in config.size) {
    const v = config.size[k];
    addRule(rules, `w-${k}`,            `width: ${v};`,       1);
    addRule(rules, `min-w-${k}`,        `min-width: ${v};`,   1);
    addRule(rules, `max-w-${k}`,        `max-width: ${v};`,   1);
    addRule(rules, `h-${k}`,            `height: ${v};`,      1);
    addRule(rules, `min-h-${k}`,        `min-height: ${v};`,  1);
    addRule(rules, `max-h-${k}`,        `max-height: ${v};`,  1);
    addRule(rules, `size-${k}`,         `width: ${v}; height: ${v};`);
  }

  addRule(rules, `w-screen`,            `width: 100vw;`,       1);
  addRule(rules, `min-w-screen`,        `min-width: 100vw;`,   1);
  addRule(rules, `max-w-screen`,        `max-width: 100vw;`,   1);
  addRule(rules, `h-screen`,            `height: 100vh;`,      1);
  addRule(rules, `min-h-screen`,        `min-height: 100vh;`,  1);
  addRule(rules, `max-h-screen`,        `max-height: 100vh;`,  1);
  addRule(rules, `size-screen`,         `width: 100vw; height: 100vh;`);

  for (let i = 0; i <= 100; i += 5) {
    addRule(rules, `opacity-${i}`,      `opacity: ${i / 100};`);
  }

  for (const v of config.cursor) {
    addRule(rules, `cursor-${v}`,       `cursor: ${v};`);
  }

  for (let i = 1; i <= 12; ++i) {
    addRule(rules, `grid-cols-${i}`,    `grid-template-columns: repeat(${i}, minmax(0, 1fr));`);
    addRule(rules, `grid-rows-${i}`,    `grid-template-rows: repeat(${i}, minmax(0, 1fr));`);
    addRule(rules, `col-start-${i}`,    `grid-column-start: ${i};`);
    addRule(rules, `row-start-${i}`,    `grid-row-start: ${i};`);
    addRule(rules, `col-end-${i}`,      `grid-column-end: ${i};`);
    addRule(rules, `row-end-${i}`,      `grid-row-end: ${i};`);
    addRule(rules, `col-span-${i}`,     `grid-column: span ${i} / span ${i};`);
    addRule(rules, `row-span-${i}`,     `grid-row: span ${i} / span ${i};`);
  }

  for (const k in config.size) {
    let v = config.size[k];
    addRule(rules, `inset-${k}`,        `inset: ${v};`);
    addRule(rules, `inset-x-${k}`,      `left: ${v}; right: ${v};`, 1);
    addRule(rules, `inset-y-${k}`,      `top: ${v}; bottom: ${v};`, 1);
    addRule(rules, `top-${k}`,          `top: ${v};`,     2);
    addRule(rules, `left-${k}`,         `left: ${v};`,    2);
    addRule(rules, `right-${k}`,        `right: ${v};`,   2);
    addRule(rules, `bottom-${k}`,       `bottom: ${v};`,  2);

    addRule(rules, `-inset-${k}`,       `inset: -${v};`);
    addRule(rules, `-inset-x-${k}`,     `left: -${v}; right: -${v};`, 1);
    addRule(rules, `-inset-y-${k}`,     `top: -${v}; bottom: -${v};`, 1);
    addRule(rules, `-top-${k}`,         `top: -${v};`,     2);
    addRule(rules, `-left-${k}`,        `left: -${v};`,    2);
    addRule(rules, `-right-${k}`,       `right: -${v};`,   2);
    addRule(rules, `-bottom-${k}`,      `bottom: -${v};`,  2);
  }

  for (let k in config.borderWidth) {
    const v = config.borderWidth[k];
    k = k === 'DEFAULT' ? '' : `-${k}`;
    addRule(rules, `border${k}`,        `border-width: ${v};`);
    addRule(rules, `border-x${k}`,      `border-left-width: ${v};border-right-width: ${v};`, 2);
    addRule(rules, `border-y${k}`,      `border-top-width: ${v};border-bottom-width: ${v};`, 2);
    addRule(rules, `border-t${k}`,      `border-top-width: ${v};`,    4);
    addRule(rules, `border-r${k}`,      `border-right-width: ${v};`,  4);
    addRule(rules, `border-b${k}`,      `border-bottom-width: ${v};`, 4);
    addRule(rules, `border-l${k}`,      `border-left-width: ${v};`,   4);
  }

  for (const k in config.column) {
    addRule(rules, `columns-${k}`,      `columns: ${config.column[k]};`);
  }

  for (let k in config.borderRadius) {
    const v = config.borderRadius[k];
    k = k === 'DEFAULT' ? '' : `-${k}`;
    addRule(rules, `rounded${k}`,       `border-radius: ${v};`);
    addRule(rules, `rounded-t${k}`,     `border-top-left-radius: ${v};border-top-right-radius: ${v};`,      1);
    addRule(rules, `rounded-r${k}`,     `border-top-right-radius: ${v};border-bottom-right-radius: ${v};`,  1);
    addRule(rules, `rounded-b${k}`,     `border-bottom-left-radius: ${v};border-bottom-right-radius: ${v};`,1);
    addRule(rules, `rounded-l${k}`,     `border-top-left-radius: ${v};border-bottom-left-radius: ${v};`,    1);
    addRule(rules, `rounded-tl${k}`,    `border-top-left-radius: ${v};`,    2);
    addRule(rules, `rounded-tr${k}`,    `border-top-right-radius: ${v};`,   2);
    addRule(rules, `rounded-br${k}`,    `border-bottom-right-radius: ${v};`,2);
    addRule(rules, `rounded-bl${k}`,    `border-bottom-left-radius: ${v};`, 2);
  }

  const spaceRules: Record<string, string> = {
    p: 'padding',
    m: 'margin',
    '-m': 'margin',
    gap: 'gap',
  };
  for (const k in config.spacing) {
    for (const prefix in spaceRules) {
      const negation = prefix[0] === '-' ? '-' : '';
      const v = negation + config.spacing[k];
      const prop = spaceRules[prefix];
      addRule(rules, `${prefix}-${k}`,  `${prop}: ${v};`);
      addRule(rules, `${prefix}x-${k}`, `${prop}-left: ${v};${prop}-right: ${v};`, 1);
      addRule(rules, `${prefix}y-${k}`, `${prop}-top: ${v};${prop}-bottom: ${v};`, 1);
      addRule(rules, `${prefix}t-${k}`, `${prop}-top: ${v};`,     2);
      addRule(rules, `${prefix}r-${k}`, `${prop}-right: ${v};`,   2);
      addRule(rules, `${prefix}b-${k}`, `${prop}-bottom: ${v};`,  2);
      addRule(rules, `${prefix}l-${k}`, `${prop}-left: ${v};`,    2);
    }
  }

  for (const k in config.spacing) {
    const v = config.spacing[k];
    const suffix = ' > :not([hidden]) ~ :not([hidden])';
    const specificity = 0;

    rules.set(`space-y-${k}`, {
      specificity,
      suffix,
      css: [
        `--tw-space-y-reverse: 0;`,
        `margin-top: calc(${v} * calc(1 - var(--tw-space-y-reverse)));`,
        `margin-bottom: calc(${v} * var(--tw-space-y-reverse));`,
      ].join(''),
    });

    rules.set(`space-x-${k}`, {
      specificity,
      suffix,
      css: [
        `--tw-space-x-reverse: 0;`,
        `margin-right: calc(${v} * calc(1 - var(--tw-space-x-reverse)));`,
        `margin-left: calc(${v} * var(--tw-space-x-reverse));`,
      ].join(''),
    });
  }

  rules.set('animate-spin', {
    specificity: 1,
    css: 'animation: spin 1s linear infinite;',
    sibling: '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }',
  });
  rules.set('animate-ping', {
    specificity: 1,
    css: 'animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;',
    sibling: '@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }',
  });
  rules.set('animate-pulse', {
    specificity: 1,
    css: 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;',
    sibling: '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }',
  });
  rules.set('animate-bounce', {
    specificity: 1,
    css: 'animation: bounce 1s infinite;',
    sibling: `@keyframes bounce {
      0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
      50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
    }`,
  });

  for (const k in config.shadow) {
    const v = config.shadow[k];
    const colored = v.replaceAll(/rgb\([^\)]+\)/g, 'var(--tw-shadow-color)');
    const name = `shadow${k ? '-' : ''}${k}`;
    const specificity = k === 'none' ? 1 : 0;
    const css = [
      '--tw-shadow-y: 1;',
      '--tw-shadow-x: -1;',
      `--tw-shadow: ${v};`,
      `--tw-shadow-colored: ${colored};`,
      'box-shadow:',
      'var(--tw-ring-offset-shadow, 0 0 #0000),',
      'var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);',
    ].join('');
    addRule(rules, name, css, specificity);
  }

  addRule(rules, 'shadow-invert-y', `--tw-shadow-y: -1;`, 1);

  const bgBlur = (v: string) => {
    const varStack = [
      'var(--tw-backdrop-blur)',
      'var(--tw-backdrop-brightness)',
      'var(--tw-backdrop-contrast)',
      'var(--tw-backdrop-grayscale)',
      'var(--tw-backdrop-hue-rotate)',
      'var(--tw-backdrop-invert)',
      'var(--tw-backdrop-opacity)',
      'var(--tw-backdrop-saturate)',
      'var(--tw-backdrop-sepia)',
    ].join(' ');
    return [
      `--tw-backdrop-blur: ${v};`,
      `--webkit-backdrop-filter: ${varStack};`,
      `backdrop-filter: ${varStack};`,
    ].join('');
  };

  addRule(rules, 'backdrop-blur-none',    bgBlur(''));
  addRule(rules, 'backdrop-blur-sm',      bgBlur('blur(4px)'));
  addRule(rules, 'backdrop-blur',         bgBlur('blur(8px)'));
  addRule(rules, 'backdrop-blur-md',      bgBlur('blur(12px)'));
  addRule(rules, 'backdrop-blur-lg',      bgBlur('blur(16px)'));
  addRule(rules, 'backdrop-blur-xl',      bgBlur('blur(24px)'));
  addRule(rules, 'backdrop-blur-2xl',     bgBlur('blur(40px)'));
  addRule(rules, 'backdrop-blur-3xl',     bgBlur('blur(64px)'));

  for (const v of [0, 75, 100, 150, 200, 300, 500, 700, 1000]) {
    addRule(rules, `duration-${v}`,       `transition-duration: ${v}ms;`, 1);
    addRule(rules, `delay-${v}`,          `transition-delay: ${v}ms;`,    1);
  }

  addRule(rules, 'ease-linear',           'transition-timing-function: linear;',                        1);
  addRule(rules, 'ease-in',               'transition-timing-function: cubic-bezier(0.4, 0, 1, 1);',    1);
  addRule(rules, 'ease-out',              'transition-timing-function: cubic-bezier(0, 0, 0.2, 1);',    1);
  addRule(rules, 'ease-in-out',           'transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);',  1);
  addRule(rules, 'transition-none',       'transition-property: none;',                                 1);
  addRule(
    rules,
    'transition-all',
    [
      'transition-property: all;',
      'transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);',
      'transition-duration: 150ms;',
    ].join(''),
  );
  addRule(
    rules,
    'transition',
    [
      'transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;',
      'transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);',
      'transition-duration: 150ms;',
    ].join(''),
  );
  addRule(
    rules,
    'transition-colors',
    [
      'transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;',
      'transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);',
      'transition-duration: 150ms;',
    ].join(''),
  );
  addRule(
    rules,
    'transition-opacity',
    [
      'transition-property: opacity;',
      'transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);',
      'transition-duration: 150ms;',
    ].join(''),
  );
  addRule(
    rules,
    'transition-shadow',
    [
      'transition-property: box-shadow;',
      'transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);',
      'transition-duration: 150ms;',
    ].join(''),
  );
  addRule(
    rules,
    'transition-transform',
    [
      'transition-property: transform;',
      'transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);',
      'transition-duration: 150ms;',
    ].join(''),
  );

  const bgGradient = (v: string) =>     `background-image: linear-gradient(to ${v}, var(--tw-gradient-stops))`;

  addRule(rules, 'bg-none',             'background-image: none;', 1);
  addRule(rules, 'bg-gradient-to-t',    bgGradient('top'));
  addRule(rules, 'bg-gradient-to-tr',   bgGradient('top right'));
  addRule(rules, 'bg-gradient-to-r',    bgGradient('right'));
  addRule(rules, 'bg-gradient-to-br',   bgGradient('bottom right'));
  addRule(rules, 'bg-gradient-to-b',    bgGradient('bottom'));
  addRule(rules, 'bg-gradient-to-bl',   bgGradient('bottom left'));
  addRule(rules, 'bg-gradient-to-l',    bgGradient('left'));
  addRule(rules, 'bg-gradient-to-tl',   bgGradient('top left'));

  for (const k in config.color) {
    const v = toColorLiteral(config.color[k]);
    const fromCSS =       [
      `--tw-gradient-from: ${v} var(--tw-gradient-from-position);`,
      `--tw-gradient-to: ${v} var(--tw-gradient-to-position);`,
      `--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);`,
    ].join('');
    const toCSS = `--tw-gradient-to: ${v} var(--tw-gradient-to-position);`;
    const viaCSS =       [
      `--tw-gradient-to: ${v} var(--tw-gradient-to-position);`,
      `--tw-gradient-stops: var(--tw-gradient-from),`,
      `${v} var(--tw-gradient-via-position), var(--tw-gradient-to);`,
    ].join('');

    addRule(rules, `from-${k}`, fromCSS);
    addRule(rules, `via-${k}`,  viaCSS, 1);
    addRule(rules, `to-${k}`,   toCSS,  2);
  }

  return rules;
}
