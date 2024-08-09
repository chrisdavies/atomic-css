export function Script(props: { value: string | (() => unknown) }) {
  let script = props.value;
  if (typeof script === 'function') {
    script = `(${script.toString()})();`;
  }
  return <script dangerouslySetInnerHTML={{ __html: script }}></script>;
}
