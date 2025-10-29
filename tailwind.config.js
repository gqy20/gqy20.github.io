/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 使用现有的 CSS 变量作为 Tailwind 的颜色系统
      colors: {
        border: 'var(--border-color)',
        background: 'var(--bg-color)',
        foreground: 'var(--text-color)',
        muted: {
          DEFAULT: 'var(--text-light)',
          foreground: 'var(--text-color)',
        },
        accent: {
          DEFAULT: 'var(--accent-color)',
          foreground: 'white',
        },
        primary: {
          DEFAULT: 'var(--primary-color)',
          foreground: 'white',
          dark: 'var(--primary-dark)',
        },
        card: {
          DEFAULT: 'var(--bg-color)',
          foreground: 'var(--text-color)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}