/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // PrepLab brand palette
        brand: {
          50: '#eef4ff',
          100: '#dde7ff',
          200: '#c2d3ff',
          300: '#9bb5ff',
          400: '#7290ff',
          500: '#506cff',
          600: '#3a4df5',
          700: '#2f3cd8',
          800: '#2935ad',
          900: '#262f88',
          950: '#1a1d52',
        },
        // Semantic
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        // Mastery heatmap bands
        mastery: {
          weak: '#ef4444',     // <40
          low: '#f97316',      // 40-59
          mid: '#eab308',      // 60-79
          strong: '#22c55e',   // 80+
          empty: '#e2e8f0',    // never attempted
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
