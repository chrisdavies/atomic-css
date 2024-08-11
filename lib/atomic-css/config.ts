/**
 * Default configuration values, and configuration processing logic.
 */

/**
 * This is a map of [font-size, line-height]
 * sm: ['14px', '20px'],
 */
type FontSizeConfig = Record<string, [string, string]>;

/**
 * The subset of Tailwind's config that we support.
 */
export type Config = {
  fontFamily: Record<string, string>;
  fontSize: FontSizeConfig;
  fontWeight: Record<string, string>;
  breakpoint: Record<string, string>;
  borderRadius: Record<string, string>;
  borderWidth: Record<string, string>;
  size: Record<string, string>;
  spacing: Record<string, string>;
  color: Record<string, string>;
  shadow: Record<string, string>;
  column: Record<string, string>;
  cursor: string[];
};

/**
 * The default configuration. This can be overridden by the client.
 */
export const defaultConfig: Config = {
  /**
   * The default color palette
   * https://tailwindcss.com/docs/customizing-colors
   */
  color: {
    transparent: 'transparent',
    current: 'currentColor',
    inherit: 'inherit',
    black: '#000',
    white: '#fff',
    'slate-50': '#f8fafc',
    'slate-100': '#f1f5f9',
    'slate-200': '#e2e8f0',
    'slate-300': '#cbd5e1',
    'slate-400': '#94a3b8',
    'slate-500': '#64748b',
    'slate-600': '#475569',
    'slate-700': '#334155',
    'slate-800': '#1e293b',
    'slate-900': '#0f172a',
    'slate-950': '#020617',
    'gray-50': '#f9fafb',
    'gray-100': '#f3f4f6',
    'gray-200': '#e5e7eb',
    'gray-300': '#d1d5db',
    'gray-400': '#9ca3af',
    'gray-500': '#6b7280',
    'gray-600': '#4b5563',
    'gray-700': '#374151',
    'gray-800': '#1f2937',
    'gray-900': '#111827',
    'gray-950': '#030712',
    'zinc-50': '#fafafa',
    'zinc-100': '#f4f4f5',
    'zinc-200': '#e4e4e7',
    'zinc-300': '#d4d4d8',
    'zinc-400': '#a1a1aa',
    'zinc-500': '#71717a',
    'zinc-600': '#52525b',
    'zinc-700': '#3f3f46',
    'zinc-800': '#27272a',
    'zinc-900': '#18181b',
    'zinc-950': '#09090b',
    'neutral-50': '#fafafa',
    'neutral-100': '#f5f5f5',
    'neutral-200': '#e5e5e5',
    'neutral-300': '#d4d4d4',
    'neutral-400': '#a3a3a3',
    'neutral-500': '#737373',
    'neutral-600': '#525252',
    'neutral-700': '#404040',
    'neutral-800': '#262626',
    'neutral-900': '#171717',
    'neutral-950': '#0a0a0a',
    'stone-50': '#fafaf9',
    'stone-100': '#f5f5f4',
    'stone-200': '#e7e5e4',
    'stone-300': '#d6d3d1',
    'stone-400': '#a8a29e',
    'stone-500': '#78716c',
    'stone-600': '#57534e',
    'stone-700': '#44403c',
    'stone-800': '#292524',
    'stone-900': '#1c1917',
    'stone-950': '#0c0a09',
    'red-50': '#fef2f2',
    'red-100': '#fee2e2',
    'red-200': '#fecaca',
    'red-300': '#fca5a5',
    'red-400': '#f87171',
    'red-500': '#ef4444',
    'red-600': '#dc2626',
    'red-700': '#b91c1c',
    'red-800': '#991b1b',
    'red-900': '#7f1d1d',
    'red-950': '#450a0a',
    'orange-50': '#fff7ed',
    'orange-100': '#ffedd5',
    'orange-200': '#fed7aa',
    'orange-300': '#fdba74',
    'orange-400': '#fb923c',
    'orange-500': '#f97316',
    'orange-600': '#ea580c',
    'orange-700': '#c2410c',
    'orange-800': '#9a3412',
    'orange-900': '#7c2d12',
    'orange-950': '#431407',
    'amber-50': '#fffbeb',
    'amber-100': '#fef3c7',
    'amber-200': '#fde68a',
    'amber-300': '#fcd34d',
    'amber-400': '#fbbf24',
    'amber-500': '#f59e0b',
    'amber-600': '#d97706',
    'amber-700': '#b45309',
    'amber-800': '#92400e',
    'amber-900': '#78350f',
    'amber-950': '#451a03',
    'yellow-50': '#fefce8',
    'yellow-100': '#fef9c3',
    'yellow-200': '#fef08a',
    'yellow-300': '#fde047',
    'yellow-400': '#facc15',
    'yellow-500': '#eab308',
    'yellow-600': '#ca8a04',
    'yellow-700': '#a16207',
    'yellow-800': '#854d0e',
    'yellow-900': '#713f12',
    'yellow-950': '#422006',
    'lime-50': '#f7fee7',
    'lime-100': '#ecfccb',
    'lime-200': '#d9f99d',
    'lime-300': '#bef264',
    'lime-400': '#a3e635',
    'lime-500': '#84cc16',
    'lime-600': '#65a30d',
    'lime-700': '#4d7c0f',
    'lime-800': '#3f6212',
    'lime-900': '#365314',
    'lime-950': '#1a2e05',
    'green-50': '#f0fdf4',
    'green-100': '#dcfce7',
    'green-200': '#bbf7d0',
    'green-300': '#86efac',
    'green-400': '#4ade80',
    'green-500': '#22c55e',
    'green-600': '#16a34a',
    'green-700': '#15803d',
    'green-800': '#166534',
    'green-900': '#14532d',
    'green-950': '#052e16',
    'emerald-50': '#ecfdf5',
    'emerald-100': '#d1fae5',
    'emerald-200': '#a7f3d0',
    'emerald-300': '#6ee7b7',
    'emerald-400': '#34d399',
    'emerald-500': '#10b981',
    'emerald-600': '#059669',
    'emerald-700': '#047857',
    'emerald-800': '#065f46',
    'emerald-900': '#064e3b',
    'emerald-950': '#022c22',
    'teal-50': '#f0fdfa',
    'teal-100': '#ccfbf1',
    'teal-200': '#99f6e4',
    'teal-300': '#5eead4',
    'teal-400': '#2dd4bf',
    'teal-500': '#14b8a6',
    'teal-600': '#0d9488',
    'teal-700': '#0f766e',
    'teal-800': '#115e59',
    'teal-900': '#134e4a',
    'teal-950': '#042f2e',
    'cyan-50': '#ecfeff',
    'cyan-100': '#cffafe',
    'cyan-200': '#a5f3fc',
    'cyan-300': '#67e8f9',
    'cyan-400': '#22d3ee',
    'cyan-500': '#06b6d4',
    'cyan-600': '#0891b2',
    'cyan-700': '#0e7490',
    'cyan-800': '#155e75',
    'cyan-900': '#164e63',
    'cyan-950': '#083344',
    'sky-50': '#f0f9ff',
    'sky-100': '#e0f2fe',
    'sky-200': '#bae6fd',
    'sky-300': '#7dd3fc',
    'sky-400': '#38bdf8',
    'sky-500': '#0ea5e9',
    'sky-600': '#0284c7',
    'sky-700': '#0369a1',
    'sky-800': '#075985',
    'sky-900': '#0c4a6e',
    'sky-950': '#082f49',
    'blue-50': '#eff6ff',
    'blue-100': '#dbeafe',
    'blue-200': '#bfdbfe',
    'blue-300': '#93c5fd',
    'blue-400': '#60a5fa',
    'blue-500': '#3b82f6',
    'blue-600': '#2563eb',
    'blue-700': '#1d4ed8',
    'blue-800': '#1e40af',
    'blue-900': '#1e3a8a',
    'blue-950': '#172554',
    'indigo-50': '#eef2ff',
    'indigo-100': '#e0e7ff',
    'indigo-200': '#c7d2fe',
    'indigo-300': '#a5b4fc',
    'indigo-400': '#818cf8',
    'indigo-500': '#6366f1',
    'indigo-600': '#4f46e5',
    'indigo-700': '#4338ca',
    'indigo-800': '#3730a3',
    'indigo-900': '#312e81',
    'indigo-950': '#1e1b4b',
    'violet-50': '#f5f3ff',
    'violet-100': '#ede9fe',
    'violet-200': '#ddd6fe',
    'violet-300': '#c4b5fd',
    'violet-400': '#a78bfa',
    'violet-500': '#8b5cf6',
    'violet-600': '#7c3aed',
    'violet-700': '#6d28d9',
    'violet-800': '#5b21b6',
    'violet-900': '#4c1d95',
    'violet-950': '#2e1065',
    'purple-50': '#faf5ff',
    'purple-100': '#f3e8ff',
    'purple-200': '#e9d5ff',
    'purple-300': '#d8b4fe',
    'purple-400': '#c084fc',
    'purple-500': '#a855f7',
    'purple-600': '#9333ea',
    'purple-700': '#7e22ce',
    'purple-800': '#6b21a8',
    'purple-900': '#581c87',
    'purple-950': '#3b0764',
    'fuchsia-50': '#fdf4ff',
    'fuchsia-100': '#fae8ff',
    'fuchsia-200': '#f5d0fe',
    'fuchsia-300': '#f0abfc',
    'fuchsia-400': '#e879f9',
    'fuchsia-500': '#d946ef',
    'fuchsia-600': '#c026d3',
    'fuchsia-700': '#a21caf',
    'fuchsia-800': '#86198f',
    'fuchsia-900': '#701a75',
    'fuchsia-950': '#4a044e',
    'pink-50': '#fdf2f8',
    'pink-100': '#fce7f3',
    'pink-200': '#fbcfe8',
    'pink-300': '#f9a8d4',
    'pink-400': '#f472b6',
    'pink-500': '#ec4899',
    'pink-600': '#db2777',
    'pink-700': '#be185d',
    'pink-800': '#9d174d',
    'pink-900': '#831843',
    'pink-950': '#500724',
    'rose-50': '#fff1f2',
    'rose-100': '#ffe4e6',
    'rose-200': '#fecdd3',
    'rose-300': '#fda4af',
    'rose-400': '#fb7185',
    'rose-500': '#f43f5e',
    'rose-600': '#e11d48',
    'rose-700': '#be123c',
    'rose-800': '#9f1239',
    'rose-900': '#881337',
    'rose-950': '#4c0519',
  },

  /**
   * Native font stacks
   * https://tailwindcss.com/docs/font-family
   */
  fontFamily: {
    sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },

  /**
   * Font sizes and their corresponding line-heights
   * https://tailwindcss.com/docs/font-size
   */
  fontSize: {
    xs: ['0.75rem', '1rem'],
    sm: ['0.875rem', '1.25rem'],
    base: ['1rem', '1.5rem'],
    lg: ['1.125rem', '1.75rem'],
    xl: ['1.25rem', '1.75rem'],
    '2xl': ['1.5rem', '2rem'],
    '3xl': ['1.875rem', '2.25rem'],
    '4xl': ['2.25rem', '2.5rem'],
    '5xl': ['3rem', '1'],
    '6xl': ['3.75rem', '1'],
    '7xl': ['4.5rem', '1'],
    '8xl': ['6rem', '1'],
    '9xl': ['8rem', '1'],
  },

  /**
   * Font weights
   * https://tailwindcss.com/docs/font-weight
   */
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  /**
   * Supported responsive breakpoints
   * https://tailwindcss.com/docs/responsive-design
   */
  breakpoint: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  /**
   * Supported rounded* rule values
   * https://tailwindcss.com/docs/border-radius
   */
  borderRadius: {
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
    none: '0px',
  },

  /**
   * Supported border widths
   * https://tailwindcss.com/docs/border-width
   */
  borderWidth: {
    DEFAULT: '1px',
    '0': '0',
    '2': '2px',
    '3': '3px',
    '4': '4px',
    '8': '8px',
  },

  /**
   * Combines with spacing to generate layout and sizes,
   * e.g. top-7 inset-2 w-1/2 size-40
   * https://tailwindcss.com/docs/size
   */
  size: {
    auto: 'auto',
    '1/2': '50%',
    '1/3': '33.333333%',
    '2/3': '66.666667%',
    '1/4': '25%',
    '2/4': '50%',
    '3/4': '75%',
    '1/5': '20%',
    '2/5': '40%',
    '3/5': '60%',
    '4/5': '80%',
    '1/6': '16.666667%',
    '2/6': '33.333333%',
    '3/6': '50%',
    '4/6': '66.666667%',
    '5/6': '83.333333%',
    '1/12': '8.333333%',
    '2/12': '16.666667%',
    '3/12': '25%',
    '4/12': '33.333333%',
    '5/12': '41.666667%',
    '6/12': '50%',
    '7/12': '58.333333%',
    '8/12': '66.666667%',
    '9/12': '75%',
    '10/12': '83.333333%',
    '11/12': '91.666667%',
    full: '100%',
    min: 'min-content',
    max: 'max-content',
    fit: 'fit-content',
    none: 'none',
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
    prose: '65ch',
    'screen-sm': '640px',
    'screen-md': '768px',
    'screen-lg': '1024px',
    'screen-xl': '1280px',
    'screen-2xl': '1536px',
  },

  /**
   * Customize the spacing rules, e.g. margin, padding, gap, etc
   * https://tailwindcss.com/docs/customizing-spacing
   */
  spacing: {
    auto: 'auto',
    px: '1px',
    '0': '0px',
    '0.5': '0.125rem',
    '1': '0.25rem',
    '1.5': '0.375rem',
    '2': '0.5rem',
    '2.5': '0.625rem',
    '3': '0.75rem',
    '3.5': '0.875rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '7': '1.75rem',
    '8': '2rem',
    '9': '2.25rem',
    '10': '2.5rem',
    '11': '2.75rem',
    '12': '3rem',
    '14': '3.5rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
    '28': '7rem',
    '32': '8rem',
    '36': '9rem',
    '40': '10rem',
    '44': '11rem',
    '48': '12rem',
    '52': '13rem',
    '56': '14rem',
    '60': '15rem',
    '64': '16rem',
    '72': '18rem',
    '80': '20rem',
    '96': '24rem',
  },

  /**
   * The box shadow defaults.
   * https://tailwindcss.com/docs/box-shadow
   */
  shadow: {
    sm: `0 calc(var(--tw-shadow-y) * 1px) 2px 0 rgb(0 0 0 / 0.05)`,
    '': `0 calc(var(--tw-shadow-y) * 1px) 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`,
    md: `0 calc(var(--tw-shadow-y) * 4px) 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`,
    lg: `0 calc(var(--tw-shadow-y) * 10px) 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`,
    xl: `0 calc(var(--tw-shadow-y) * 20px) 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`,
    '2xl': `0 calc(var(--tw-shadow-y) * 25px) 50px -12px rgb(0 0 0 / 0.25)`,
    inner: `inset 0 calc(var(--tw-shadow-y) * 2px) 4px 0 rgb(0 0 0 / 0.05)`,
    none: `0 0 #0000`,
  },

  /**
   * Controls the number of columns in an element.
   * https://tailwindcss.com/docs/columns
   */
  column: {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    '11': '11',
    '12': '12',
    auto: 'auto',
    '3xs': '16rem',
    '2xs': '18rem',
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
  },

  /**
   * The supported mouse cursors:
   * https://tailwindcss.com/docs/cursor
   */
  cursor: [
    'auto',
    'default',
    'pointer',
    'wait',
    'text',
    'move',
    'help',
    'not-allowed',
    'none',
    'context-menu',
    'progress',
    'cell',
    'crosshair',
    'vertical-text',
    'alias',
    'copy',
    'no-drop',
    'grab',
    'grabbing',
    'all-scroll',
    'col-resize',
    'row-resize',
    'n-resize',
    'e-resize',
    's-resize',
    'w-resize',
    'ne-resize',
    'nw-resize',
    'se-resize',
    'sw-resize',
    'ew-resize',
    'ns-resize',
    'nesw-resize',
    'nwse-resize',
    'zoom-in',
    'zoom-out',
  ],
};

/**
 * Convert a segment of a hex color to a numeric rgb value.
 *
 * parseHex('f21', 0); -> 16
 * parseHex('f21', 1); -> 2
 * parseHex('0000ff', 2); -> 255
 */
function parseHex(color: string, i: number) {
  const hex = color.length === 3 ? color[i] + color[i] : color.slice(i * 2, i * 2 + 2);
  return parseInt(hex, 16);
}

/**
 * Convert a hex color to its rgb numbers:
 * #ff0002 -> 255 0 2
 */
function hexToRGB(color: string) {
  if (color[0] !== '#') {
    return color;
  }
  // Drop the leading '#'
  color = color.slice(1);
  const r = parseHex(color, 0);
  const g = parseHex(color, 1);
  const b = parseHex(color, 2);
  return `${r} ${g} ${b}`;
}

/**
 * Given an optional config, return the full configuration in
 * a form that is optimal for processing.
 */
export function compileConfig(config: Partial<Config> = {}): Config {
  const result: any = { ...defaultConfig };

  // Merge the values of config into the defaults
  for (const k in result) {
    const v1 = result[k];
    const v2 = (config as any)[k];
    if (Array.isArray(v1)) {
      result[k] = [...v1, ...(v2 || [])];
    } else {
      result[k] = { ...v1, ...v2 };
    }
  }

  // Convert any hex colors to rgb so we can easily apply
  // opacity to them in derivative rules.
  for (const k in result.color) {
    result.color[k] = hexToRGB(result.color[k]);
  }

  // Convert breakpoints to `@media (...)` so they are directly
  // usable by our CSS builder.
  for (const k in result.breakpoint) {
    const v = result.breakpoint[k];
    if (!v.startsWith('@media')) {
      result.breakpoint[k] = `@media (min-width: ${v})`;
    }
  }

  // Expand size by including spacing rules
  result.size = { ...result.spacing, ...result.size };

  return result;
}
