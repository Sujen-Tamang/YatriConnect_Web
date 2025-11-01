/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          display: ['Outfit', 'sans-serif'],
        },
        colors: {
          brand: {
            primary: '#59f20d', // Neon green
            dark: '#0d140a', // Deepest background
            surface: '#1c2619', // Elevated surface
            border: '#2e3928', // Borders
            muted: '#a6ba9c', // Muted text
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#59f20d', // Fallbacks, though we use specific names mostly
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
            950: '#082f49',
          },
          dark: {
            bg: '#0F172A',
            surface: '#1E293B',
            border: '#334155',
          }
        },
        animation: {
          'blob': 'blob 7s infinite',
          'fade-in': 'fadeIn 0.5s ease-out',
          'slide-up': 'slideUp 0.6s ease-out forwards',
        },
        keyframes: {
          blob: {
            '0%': { transform: 'translate(0px, 0px) scale(1)' },
            '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
            '100%': { transform: 'translate(0px, 0px) scale(1)' },
          },
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          }
        }
      },
    },
    plugins: [],
  }