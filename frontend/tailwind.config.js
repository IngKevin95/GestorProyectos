/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors (Deep Pine & Gold)
        primary: {
          DEFAULT: '#0D2E2B',  // Deep Pine
          50: '#F5F8F7',
          100: '#E6F0EE',
          500: '#18524C',
          600: '#0D2E2B',
          700: '#071A18',
        },
        brand: {
          pine: '#0D2E2B',     // Deep Pine
          gold: '#C69C6D',     // Champagne Gold
          alabaster: '#FAFAF9', // Background
          onyx: '#1C1917',     // Dark text/bg
        },
        // Override Tailwind default blues/cyans with Deep Pine & Gold
        indigo: {
          50: '#F5F8F7',
          100: '#E6F0EE',
          200: '#C2DCD9',
          300: '#9EC7C3',
          400: '#7AB3AD',
          500: '#569E98',
          600: '#18524C',
          700: '#0D2E2B',
          800: '#071A18',
          900: '#030E0C',
        },
        blue: {
          50: '#F5F8F7',
          100: '#E6F0EE',
          200: '#C2DCD9',
          300: '#9EC7C3',
          400: '#7AB3AD',
          500: '#569E98',
          600: '#18524C',
          700: '#0D2E2B',
          800: '#071A18',
          900: '#030E0C',
        },
        cyan: {
          50: '#FCF8F3',
          100: '#F9F1E7',
          200: '#EFDFC3',
          300: '#E6CC9F',
          400: '#C69C6D',
          500: '#B58655',
          600: '#A37140',
          700: '#8C5E31',
          800: '#754B23',
          900: '#5E3816',
        },
        // KPI status colors
        kpi: {
          green: '#10B981',    // CPI >= 1.0
          yellow: '#F59E0B',   // 0.90-0.99
          red: '#DC2626',      // < 0.90
        },
      },
    },
  },
  plugins: [],
}
