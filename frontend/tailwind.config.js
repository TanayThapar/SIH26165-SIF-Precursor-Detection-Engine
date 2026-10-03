/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: 'var(--bg-canvas)',
          subtle: 'var(--bg-canvas-subtle)',
          muted: 'var(--bg-canvas-muted)',
        },
        surface: {
          DEFAULT: 'var(--bg-surface)',
          raised: 'var(--bg-surface-raised)',
          sunken: 'var(--bg-surface-sunken)',
          border: 'var(--border-surface)',
          'border-strong': 'var(--border-surface-strong)',
        },
        graphite: {
          950: '#0F1318',
          900: '#151921',
          850: '#1C222C',
          800: '#242C38',
          700: '#343E4E',
          600: '#485669',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
        },
        petrol: {
          50: '#F0F9F9',
          100: '#D5EDED',
          200: '#A8DBDB',
          300: '#6CBFC0',
          400: '#3CA0A2',
          500: '#228285', // primary oxidized teal
          600: '#1A686B',
          700: '#155255',
          800: '#124345',
          900: '#103739',
          950: '#062021',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706', // industrial warning
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        signal: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626', // signal red
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        operational: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D', // operational green
          800: '#166534',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        panel: 'var(--card-shadow)',
        elevated: '0 8px 24px -4px rgba(0, 0, 0, 0.25), 0 3px 8px -2px rgba(0, 0, 0, 0.15)',
        dropdown: '0 12px 28px -4px rgba(0, 0, 0, 0.35), 0 4px 10px -2px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.22s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
        'radar-ping': 'radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'seismic-pulse': 'seismicPulse 4s ease-in-out infinite',
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
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.88', transform: 'scale(1.02)' },
        },
        radarPing: {
          '75%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        seismicPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
