import { IcoMoon, IcoSun } from 'components/icons';
import { Script } from 'components/script';

type DarkMode = 'dark' | 'light';

function toggleDarkmode() {
  const doc = document.documentElement;
  const btn = document.querySelector<HTMLButtonElement>('.btn-toggle-theme')!;
  const getTheme = () => (doc.classList.contains('dark') ? 'dark' : 'light');
  const setTheme = (theme: DarkMode) => {
    const prefersDark = !!window.matchMedia('(prefers-color-scheme: dark)').matches;
    doc.classList.remove('light', 'dark');
    doc.classList.add(theme);
    btn.innerHTML = btn.dataset[theme]!;
    // If the chosen theme is the system preference, we'll clear localStorage.
    if ((theme === 'dark') === prefersDark) {
      localStorage.removeItem('theme');
    } else {
      localStorage.theme = theme;
    }
    return theme;
  };
  btn.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
  setTheme(getTheme());
}

export function ToggleTheme() {
  return (
    <>
      <button
        type="button"
        class="btn-toggle-theme"
        data-light={<IcoSun />}
        data-dark={<IcoMoon />}
      ></button>
      <Script value={toggleDarkmode} />
    </>
  );
}
