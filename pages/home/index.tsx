import { route } from 'app';
import { HtmlPage } from 'components/html-page';

route.add('get', Page);

function Page() {
  return (
    <HtmlPage title="Atomic CSS" headChildren={<link rel="stylesheet" href="dist/bundle.css" />}>
      <h1>Hello, world!</h1>
    </HtmlPage>
  );
}
