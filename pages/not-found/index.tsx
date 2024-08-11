import { route } from 'app';
import { HtmlPage } from 'components/html-page';
import { html } from 'lib/jsx/html';

route.add('*', () =>
  html(
    <HtmlPage title="404">
      <article class="px-4 flex flex-col justify-center gap-4 max-w-2xl mx-auto pt-20">
        <header>
          <h1 class="inline-block text-6xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-sky-500 to-violet-500">
            404 Not Found
          </h1>
        </header>
        <p>
          You came here looking for my indispensable insights, unparalleled wit and wisdom, but all
          you got was this crummy 404 page. It's probably best to bury your feelings deep inside,
          and let{' '}
          <a href="/" class="prev-blog-post-link">
            my home page
          </a>{' '}
          distract you from the crushing disappointment you're feeling.
        </p>
        <footer>
          <a
            href="/"
            class="inline-flex items-center gap-1.5 rounded-full bg-sky-500 hover:bg-pink-600 text-white pr-4 p-2 transition-all"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
            <span>Home</span>
          </a>
        </footer>
      </article>
    </HtmlPage>,
    {
      status: 404,
    },
  ),
);
