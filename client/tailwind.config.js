/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0f7f4',
          100: '#d7ece3',
          200: '#b2dbcb',
          300: '#83c2ad',
          400: '#4fa889',
          500: '#2d8a6b',
          600: '#1f6d54',
          700: '#185643',
          800: '#124334',
          900: '#0e3b2e',
          950: '#062119',
        },
        cream: {
          50:  '#fcfbf9',
          100: '#f8f5ee',
          200: '#f0ebdc',
          300: '#e5dcc6',
          400: '#d4c5a5',
          500: '#c0ad84',
          600: '#a7936a',
          700: '#867453',
          800: '#6d5e44',
          900: '#594d38',
        },
        gold: {
          50:  '#fdfbf0',
          100: '#f9f5da',
          200: '#f2e8b0',
          300: '#e8d47d',
          400: '#debe4d',
          500: '#d4af37',
          600: '#b89028',
          700: '#926e21',
          800: '#775820',
          900: '#644820',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft':       '0 4px 20px -2px rgba(14, 59, 46, 0.08)',
        'card':       '0 10px 30px -4px rgba(14, 59, 46, 0.12)',
        'glow':       '0 0 25px rgba(212, 175, 55, 0.35)',
        'inner-glow': 'inset 0 2px 8px rgba(255, 255, 255, 0.2)',
        'xs':         '0 1px 4px rgba(0,0,0,0.06)',
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.4s ease-out both',
        'slide-up':   'slideUp 0.4s ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-none': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        '.text-shadow': {
          'text-shadow': '0 2px 8px rgba(0,0,0,0.30)',
        },
        '.backdrop-blur-xs': {
          'backdrop-filter': 'blur(4px)',
        },
      });
    },
  ],
};
