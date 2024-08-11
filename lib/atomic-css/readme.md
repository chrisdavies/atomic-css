# Atomic CSS

This is a zero-dependency Tailwind-like library.

The goal isn't 100% parity with Tailwind, but rather a proof-of-concept as to what is possible without pulling in a bunch of dependencies.

## Unsupported

There is no support for:

- Custom values (e.g. `text-[280rem]`)
- Applying seudo selectors via `@apply`
  - This works: `@apply text-2xl bg-red-600`
  - This doesn't: `@apply hover:bg-blue-600`
- Themes
- Plugins

## Supported

- Basic CSS rules (any which aren't implemented should be trivial to add)
- `@layer utilities`
- Basic `@apply` directives in CSS
- CSS import inlining
- Watch mode / incremental builds

## Code

- `config.ts` contains the default configuration values and helper functions
- `css-parser.ts` is a (really) basic CSS parser
- `css-processor.ts` processes the root CSS file
  - Inline basic imports
  - Inject the preflight CSS into `@layer base;`
  - Extract utility classes
  - Expand `@apply` directives
- `index.ts` is the public API
- `layer-builder.ts` is the logic for generating the final `@layer utilities`
- `ls.ts` is a utility for crawling source directories
- `preflight.css` is a copy / paste (and tweak) of the Tailwind preflight CSS file.
- `rule-gen.ts` converts configs into the CSS rules which the engine will use

