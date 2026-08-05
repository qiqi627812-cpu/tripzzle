/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'app-page-home',
    'app-page-ai-plan',
    'app-page-guide',
    'app-page-itinerary',
    'app-page-placeSearch',
    'app-page-weather',
    'app-page-packing',
    'app-page-expense',
    'app-page-reminder',
    'app-page-favorites',
  ],
  theme: {
    extend: {
      colors: {
        trip: {
          // ─── Background ───
          bg: '#F8F3E9',
          'bg-warm': '#EFE7D9',
          cloud: '#FBF8F1',
          surface: '#FFFCF6',

          // ─── Text ───
          ink: '#302D29',
          slate: '#5E584F',
          muted: '#756D62',
          faint: '#A59B8C',

          // ─── Brand Olive ───
          mint: '#738467',
          'mint-light': '#9BAA91',
          'mint-dark': '#536249',
          'mint-pale': '#EEF2E9',
          teal: '#738467',
          'teal-light': '#9BAA91',
          'teal-dark': '#536249',
          'teal-pale': '#EEF2E9',

          // ─── Accent Coral ───
          coral: '#E98255',
          'coral-light': '#F0A17F',
          'coral-dark': '#B95F3C',
          'coral-pale': '#F9E9DD',

          // ─── Warm / Sand ───
          amber: '#C89A55',
          'amber-light': '#DEBA82',
          'amber-dark': '#95713E',
          'amber-pale': '#F8F0E1',
          sand: '#F8F0E1',

          // ─── Cool / Fog ───
          fog: '#879A94',
          'fog-light': '#B5C2BD',
          'fog-dark': '#62746E',
          'fog-pale': '#EDF2EF',
          blue: '#708E94',
          'blue-light': '#9DB4B8',
          'blue-dark': '#506C72',
          'blue-pale': '#ECF1F1',

          // ─── Olive ───
          olive: '#738467',
          'olive-light': '#9BAA91',
          'olive-dark': '#536249',
          'olive-pale': '#EEF2E9',

          // ─── Rose / Pink ───
          rose: '#C77E79',
          'rose-light': '#DCA4A0',
          'rose-dark': '#985B57',
          'rose-pale': '#F7EAE8',

          // ─── Border / Structure ───
          border: '#DDD2C1',
          'border-dark': '#C7B9A4',

          // ─── Semantic ───
          success: '#3D8B5E',
          'success-pale': '#E8F5ED',
          warning: '#C9943E',
          'warning-pale': '#FBF5E8',
          error: '#C75858',
          'error-pale': '#F9EDED',
        },
      },
      fontFamily: {
        display: ['"Tripzzle Playful"', '"YouYuan"', '"幼圆"', 'sans-serif'],
        sans: ['"Tripzzle Playful"', '"YouYuan"', '"幼圆"', '"PingFang SC"', 'sans-serif'],
        mono: ['"SF Mono"', '"Fira Code"', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.8125rem', { lineHeight: '1.375' }],
        'base': ['1rem', { lineHeight: '1.625' }],
        'lg': ['1.125rem', { lineHeight: '1.625' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.375' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
        '5xl': ['3rem', { lineHeight: '1.15' }],
        '6xl': ['3.5rem', { lineHeight: '1.1' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      boxShadow: {
        card: '0 10px 30px rgba(84, 67, 45, 0.055)',
        soft: '0 6px 20px rgba(84, 67, 45, 0.055)',
        elevated: '0 18px 42px rgba(84, 67, 45, 0.11), 0 2px 8px rgba(84, 67, 45, 0.05)',
        overlay: '0 24px 64px rgba(84, 67, 45, 0.16)',
        glass: '0 18px 50px rgba(84, 67, 45, 0.10), inset 0 1px 0 rgba(255,255,255,0.85)',
        glow: '0 0 0 3px rgba(115,132,103,0.13)',
        'glow-coral': '0 0 0 3px rgba(233,130,85,0.13)',
        'inner-subtle': 'inset 0 1px 2px rgba(84,67,45,0.05)',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-up': 'fade-up 0.4s ease-out forwards',
        'slide-up': 'slide-up 0.25s ease-out forwards',
        'scale-in': 'scale-in 0.2s ease-out forwards',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
