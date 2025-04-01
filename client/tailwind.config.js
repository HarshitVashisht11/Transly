/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        transly: {
          '50': 'hsl(var(--transly-50))',
          '100': 'hsl(var(--transly-100))',
          '200': 'hsl(var(--transly-200))',
          '300': 'hsl(var(--transly-300))',
          '400': 'hsl(var(--transly-400))',
          '500': 'hsl(var(--transly-500))',
          '600': 'hsl(var(--transly-600))',
          '700': 'hsl(var(--transly-700))',
          '800': 'hsl(var(--transly-800))',
          '900': 'hsl(var(--transly-900))',
          '950': 'hsl(var(--transly-950))',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    'from-transly-50', 'from-transly-100', 'from-transly-200', 'from-transly-300', 'from-transly-400',
    'from-transly-500', 'from-transly-600', 'from-transly-700', 'from-transly-800', 'from-transly-900', 'from-transly-950',
    'to-transly-50', 'to-transly-100', 'to-transly-200', 'to-transly-300', 'to-transly-400',
    'to-transly-500', 'to-transly-600', 'to-transly-700', 'to-transly-800', 'to-transly-900', 'to-transly-950',
  ],
}
