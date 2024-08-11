import { route } from 'app';
import { HtmlPage } from 'components/html-page';

route.add('get', Page);

function Page() {
  return (
    <HtmlPage title="Demo">
      <section class="p-4 flex flex-col gap-4">
        <h1 class="text-5xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-sky-500 to-orange-500">
          Hello, world!
        </h1>
        <p>This is a demo of a lightweight Tailwind-like library.</p>
        <p>
          Go to{' '}
          <code class="inline-block bg-zinc-200 dark:bg-zinc-800 dark:text-white px-1.5 rounded font-mono text-sm">
            pages/home/index.tsx
          </code>{' '}
          to edit this and play around.
        </p>
      </section>
    </HtmlPage>
  );
}
