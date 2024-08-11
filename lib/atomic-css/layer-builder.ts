/**
 * The core of the Tailwind-lite library. This module converts rules,
 * breakpoints, and and class names into the utilities layer.
 */

import type { RuleLookupTable } from './rule-gen';

export type LayerBuilder = {
  /**
   * Return the @layer utilities { ... } CSS as a string.
   */
  toString(): string;
  /**
   * Update the builder's internal state based on class names
   * extracted from the specified source code. Sources should
   * be source *content*, not file names.
   */
  update(sources: Iterable<string>): void;
};

/**
 * The argument for the utility processor function.
 */
type ProcessorOptions = {
  /**
   * The rules which were derived from our CSS file and our config.
   */
  rules: RuleLookupTable;
  /**
   * The breakpoint configuration (e.g. { md: '45rem' })
   */
  breakpoints: Record<string, string>;
};

/**
 * A rule which will be written out as CSS.
 */
type OutputRule = {
  /**
   * The selector (e.g. ".hover\:bg-red-600")
   */
  selector: string;
  /**
   * The breakpoint name (e.g. "md")
   */
  breakpoint: string;
  /**
   * The specificity, used to sort rules before stringifying.
   */
  specificity: number;
  /**
   * The body of the CSS, without braces (e.g. "color: red;")
   */
  css: string;
  /**
   * An optional sibling CSS rule to be written. This is something
   * like "@keyframes slide-in { 0% { left: 8rem; } 100% { left: 0; } }"
   */
  sibling?: string;
};

/**
 * Convert the specified class name into an output rule, if it is
 * a valid utility class name.
 */
function makeOutputRule(
  className: string,
  rules: RuleLookupTable,
  breakpoints: Record<string, string>,
): OutputRule | undefined {
  const [name, ...pseudos] = className.split(':').reverse();
  const rule = rules.get(name);
  if (!rule) {
    return;
  }
  const result: OutputRule = {
    selector: '.' + className.replaceAll(/[\:\/\.]/g, (ch) => `\\${ch}`),
    breakpoint: '',
    specificity: rule.specificity,
    css: rule.css,
    sibling: rule.sibling,
  };
  for (const pseudo of pseudos) {
    if (breakpoints[pseudo]) {
      result.breakpoint = pseudo;
    } else if (pseudo === 'dark') {
      result.selector = `.dark ${result.selector}`;
    } else {
      result.selector = `${result.selector}:${pseudo}`;
    }
  }
  if (rule.suffix) {
    result.selector += rule.suffix;
  }
  return result;
}

/**
 * Combine multiple rules into one where possible. For example,
 * "text-white" and "hover:text-white" are the same rule, just with
 * a different selector, so we combine them into a final output rule
 * that has a selector ".text-white .hover\:text-white:hover"
 */
function mergeDuplicateRules(outputRules: OutputRule[]) {
  const merged: Record<string, OutputRule> = {};
  for (const rule of outputRules) {
    const key = `${rule.breakpoint}:${rule.specificity}:${rule.css}`;
    const dup = merged[key];
    if (!dup) {
      merged[key] = rule;
      continue;
    }
    const selector = dup.selector + ',' + rule.selector;
    const sibling =
      dup.sibling === rule.sibling ? dup.sibling : `${rule.sibling || ''}${dup.sibling || ''}`;
    merged[key] = { ...dup, selector, sibling };
  }
  return Object.values(merged);
}

/**
 * Convert the output rules to CSS.
 */
function stringifyUtilities({
  breakpoints,
  outputRules,
}: {
  breakpoints: Record<string, string>;
  outputRules: OutputRule[];
}) {
  // Track sibling rules (generally, these are @keyframe animation definitions)
  // and ensure we only write them once.
  const siblings = new Set<string>();
  // Each ruleset will be grouped by its breakpoint and stored here.
  const breakpointRules: Record<string, string[]> = {};
  const mergedRules = mergeDuplicateRules(outputRules).sort(
    (a, b) => a.specificity - b.specificity,
  );

  for (const rule of mergedRules) {
    let arr = breakpointRules[rule.breakpoint];
    if (!arr) {
      arr = [];
      breakpointRules[rule.breakpoint] = arr;
    }
    arr.push(`${rule.selector}{${rule.css}}`);
    if (rule.sibling && !siblings.has(rule.sibling)) {
      arr.push(rule.sibling);
      siblings.add(rule.sibling);
    }
  }

  // Convert each breakpoint into its final CSS.
  const css = Object.keys(breakpointRules).map((k) => {
    const value = breakpointRules[k].join('\n');
    return k ? `${breakpoints[k]} {${value}}` : value;
  });

  return `@layer utilities{${css.join('\n')}}`;
}

/**
 * Extract Tailwind utility classes from the specified source code.
 */
function* sourceClasses(sources: Iterable<string>) {
  const classNameRegex = /[a-z\-][a-z\:\-\/0-9\.]+/g;
  for (const source of sources) {
    for (const [className] of source.matchAll(classNameRegex)) {
      yield className;
    }
  }
}

/**
 * Create a builder that converts class names into @layer utilities CSS.
 */
export function makeUtilitiesLayerBuilder({ rules, breakpoints }: ProcessorOptions): LayerBuilder {
  const outputRules: OutputRule[] = [];
  const skipClasses = new Set<string>();
  return {
    toString() {
      return stringifyUtilities({ outputRules, breakpoints });
    },
    update(sources: Iterable<string>) {
      for (const className of sourceClasses(sources)) {
        if (skipClasses.has(className)) {
          continue;
        }
        skipClasses.add(className);
        const rule = makeOutputRule(className, rules, breakpoints);
        if (rule) {
          outputRules.push(rule);
        }
      }
    },
  };
}
