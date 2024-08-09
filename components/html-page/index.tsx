import type { ComponentChildren } from 'lib/jsx';
import { Script } from 'components/script';
import { ToggleTheme } from 'components/toggle-theme';

export function HtmlPage({
  title,
  headChildren,
  children,
}: {
  title: string;
  headChildren?: ComponentChildren;
  children?: ComponentChildren;
}) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/css/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} | demo</title>
        {headChildren}
        <Script
          value={() => {
            if (
              localStorage.theme === 'dark' ||
              (!('theme' in localStorage) &&
                window.matchMedia('(prefers-color-scheme: dark)').matches)
            ) {
              document.documentElement.classList.add('dark');
            }
          }}
        />
      </head>
      <body class="dark:bg-stone-900 dark:text-stone-200">
        <header class="flex justify-between items-center p-4 pr-2 mb-4">
          <a href="/" class="flex items-center gap-4">
            <img src="/css/favicon.svg" alt="Logo" class="size-6" /> Atomic CSS
          </a>
          <aside>
            <ToggleTheme />
          </aside>
        </header>

        {children}
      </body>
    </html>
  );
}
