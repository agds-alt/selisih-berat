import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',  // Small phones (iPhone SE, etc.)
        'sm': '640px',  // Default Tailwind
        'md': '768px',  // Tablet
        'lg': '1024px', // Desktop
        'xl': '1280px',
        '2xl': '1536px',
      },
      fontSize: {
        // Mobile-optimized font sizes (compact like banking apps)
        'mobile-xs': ['10px', { lineHeight: '14px' }],
        'mobile-sm': ['12px', { lineHeight: '16px' }],
        'mobile-base': ['14px', { lineHeight: '20px' }],
        'mobile-lg': ['16px', { lineHeight: '24px' }],
        'mobile-xl': ['18px', { lineHeight: '26px' }],
      },
      spacing: {
        // Compact spacing for mobile
        'tight': '4px',
        'compact': '8px',
        'comfortable': '12px',
        'nav': '64px',  // Bottom nav height
      },
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626', // J&T Red
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      scale: {
        '98': '0.98',
      },
    },
  },
  plugins: [],
}
export default config
