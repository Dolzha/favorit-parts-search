// Варианты оформления для выбора: ?v=1, ?v=2, ?v=3. Без параметра стандартный Bootstrap.
const FONTS = {
  1: 'Inter:wght@400;500;600;700',
  2: 'Manrope:wght@400;500;700;800&family=JetBrains+Mono:wght@400;600',
  3: 'Golos+Text:wght@400;500;600;700',
};

export function applyTheme() {
  const v = new URLSearchParams(window.location.search).get('v');
  if (!FONTS[v]) return;
  document.documentElement.dataset.theme = v;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${FONTS[v]}&display=swap`;
  document.head.appendChild(link);

  // Переключатель вариантов в углу экрана
  const bar = document.createElement('div');
  bar.className = 'theme-switch';
  bar.innerHTML = ['0', '1', '2', '3']
    .map((n) => `<a href="?v=${n}" class="${n === v ? 'on' : ''}">${n === '0' ? 'Bootstrap' : `Вариант ${n}`}</a>`)
    .join('');
  document.body.appendChild(bar);
}
