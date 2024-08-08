import { expect, describe, test } from 'bun:test';
import { renderToString, type JSXResult } from './index';

describe('jsx', () => {
  test('it interpolates arguments', () => {
    const tests: Array<[JSXResult, string]> = [
      [<h1>Hello, {'bob'}!</h1>, `<h1>Hello, bob!</h1>`],
      [<>{32} is my age</>, '32 is my age'],
      [<>{null} is my age</>, ' is my age'],
      [<>{undefined} is my age</>, ' is my age'],
      [<>{false} is my age</>, ' is my age'],
      [<>{0} is my age</>, '0 is my age'],
      [
        <>{'<script>alert("pwned!")</script>'}</>,
        '&lt;script&gt;alert(&quot;pwned!&quot;)&lt;/script&gt;',
      ],
      [
        <>
          {true} is {'true'}
        </>,
        'true is true',
      ],
      [<em dangerouslySetInnerHTML={{ __html: '<b>Hi</b>' }} />, `<em><b>Hi</b></em>`],
    ];
    for (const [actual, expected] of tests) {
      expect(renderToString(actual)).toEqual(expected);
    }
  });

  test('it supports nesting', () => {
    const Heading = ({ name }: { name: string }) => <h1>Hi, {name}!</h1>;
    const content = (
      <>
        <p>Nest?</p>
        <Heading name="Fred" />
        <p>Yep!</p>
      </>
    );
    expect(renderToString(content)).toEqual(`<p>Nest?</p><h1>Hi, Fred!</h1><p>Yep!</p>`);
  });

  test('it supports boolean attributes', () => {
    const tests: Array<[JSXResult, string]> = [
      [<input checked={true} />, `<input checked />`],
      [<input required={true} />, `<input required />`],
      [<input data-required={'yup'} />, `<input data-required="yup" />`],
      [<input data-required={1} />, `<input data-required="1" />`],
      [<input checked={false} />, `<input />`],
      [<input required={false} />, `<input />`],
      [<input data-required={0} />, `<input data-required="0" />`],
    ];
    for (const [actual, expected] of tests) {
      expect(renderToString(actual)).toEqual(expected);
    }
  });

  test('it supports event handlers', () => {
    const handler = (e: any) => alert(e.target.textContent);
    const actual = <button onClick={handler}>Click Me!</button>;
    const expected = `<button onClick="((e) =&gt; alert(e.target.textContent))(event)">Click Me!</button>`;
    expect(renderToString(actual)).toEqual(expected);
  });

  test('it prevents unsupported href values', () => {
    const tests: Array<[JSXResult, string]> = [
      [<a href={'foo'} />, '<a href="foo"></a>'],
      [<a href={'https://bar'} />, '<a href="https://bar"></a>'],
      [<a href={'http://bar'} />, '<a href="http://bar"></a>'],
      [<a href={'javascript:alert("hi")'} />, '<a href=""></a>'],
      [<a href={'javascript&#58;alert("hi")'} />, '<a href=""></a>'],
      [
        <a href={'javascript&#59;alert("hi")'} />,
        `<a href="javascript&amp;#59;alert(&quot;hi&quot;)"></a>`,
      ],
    ];
    for (const [actual, expected] of tests) {
      expect(renderToString(actual)).toEqual(expected);
    }
  });

  test('it supports children', () => {
    const names = ['Henry', 'Evie', 'Miles', 'Rose'];
    const children = names.map((name) => <li>{name}</li>);
    const content = <ul>{children}</ul>;
    const expected = [
      `<ul>`,
      `<li>Henry</li>`,
      `<li>Evie</li>`,
      `<li>Miles</li>`,
      `<li>Rose</li>`,
      `</ul>`,
    ].join('');
    expect(renderToString(content)).toEqual(expected);
  });
});
