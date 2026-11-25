/** Centralised design tokens — colours resolve to CSS variables so light/dark share one config. */
const v = (n) => `rgb(var(--${n}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        bg: v('bg'), surface: v('surface'), subtle: v('subtle'), line: v('line'),
        ink: v('ink'), muted: v('muted'), faint: v('faint'),
        brand: { DEFAULT: v('brand'), soft: v('brand-soft'), strong: v('brand-strong') },
        ok: v('ok'), warn: v('warn'), bad: v('bad'), info: v('info'), vis: v('vis'),
      },
      borderRadius: { xl: '0.75rem', '2xl': '1rem' },
      boxShadow: { card: '0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.04)', pop: '0 10px 30px -8px rgb(15 23 42 / 0.25)' },
      fontSize: { xxs: ['0.6875rem', '1rem'] },
    },
  },
  plugins: [],
}
