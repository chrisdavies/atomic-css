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
        <footer class="flex gap-4 mt-4 flex-col sm:flex-row">
          <button
            class="bg-pink-600 active:bg-pink-500 text-white rounded-full p-2 px-4 cursor-pointer transition-all outline-pink-500"
            onClick={(e: any) => {
              (e.target as HTMLButtonElement).classList.toggle('animate-pulse');
            }}
          >
            Click to pulse
          </button>

          <button
            class="bg-sky-600 active:bg-sky-500 text-white rounded-full p-2 px-4 cursor-pointer relative transition-all"
            onClick={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              const spinner = target.querySelector('.js-spin');
              const content = target.querySelector('.js-content')!;
              if (spinner) {
                spinner.remove();
                content.classList.remove('invisible');
                return;
              }
              content.classList.add('invisible');
              content.insertAdjacentHTML(
                'afterend',
                [
                  `<span class="js-spin flex items-center justify-center absolute inset-0">`,
                  `<span class="inline-block border-2 border-current border-t-transparent animate-spin size-6 rounded-full"></span>`,
                  `</span>`,
                ].join(''),
              );
            }}
          >
            <span class="js-content">Click to spin</span>
          </button>
        </footer>
      </section>
    </HtmlPage>
  );
}
