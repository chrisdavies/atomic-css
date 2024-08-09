import { route } from 'app';
import { HtmlPage } from 'components/html-page';
import { html } from 'lib/jsx/html';

route.add('*', () =>
  html(
    <HtmlPage title="404">
      <div class="blog-post">
        <article>
          <h1>404 | Not Found</h1>
          <p>
            You came here looking for my indispensable insights, unparalleled wit and wisdom, but
            all you got was this crummy 404 page. It's probably best to bury your feelings deep
            inside, and let{' '}
            <a href="/" class="prev-blog-post-link">
              my home page
            </a>{' '}
            distract you from the crushing disappointment you're feeling.
          </p>
        </article>
      </div>
    </HtmlPage>,
    {
      status: 404,
    },
  ),
);
