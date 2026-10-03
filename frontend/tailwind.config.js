/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F4F5F7',
          subtle: '#ECEFF2',
          muted: '#E2E6EB',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#FAFBFC',
          sunken: '#EDF0F3',
          border: '#DCE1E7',
          'border-strong': '#CBD5E1',
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
        panel: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        elevated: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        dropdown: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
      },
    },
  },
  plugins: [],
}
