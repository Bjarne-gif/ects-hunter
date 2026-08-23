/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface:  '#1A1D27',
        panel:    '#20243A',
        border:   '#2A2D3E',
        accent:   '#6366F1',
        success:  '#10B981',
        warning:  '#F59E0B',
        danger:   '#EF4444',
        muted:    '#475569',
        textpri:  '#F1F5F9',
        textsec:  '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
