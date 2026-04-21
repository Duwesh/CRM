/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
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
        // Legacy support
        navy: {
          DEFAULT: "#0d1b2a",
          2: "#132338",
          3: "#1a2f45",
          4: "#1e3a52",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light: "#e4c87a",
          soft: "rgba(201,168,76,0.12)",
          border: "rgba(201,168,76,0.25)",
        },
        "border-2": "rgba(255,255,255,0.12)",
        text: {
          DEFAULT: "#ffffff",
          2: "#94a3b8",
          3: "#4a6080",
        },
        teal: {
          DEFAULT: "#2dd4bf",
          soft: "rgba(45,212,191,0.1)",
        },
        red: {
          DEFAULT: "#f87171",
          soft: "rgba(248,113,113,0.12)",
        },
        green: {
          DEFAULT: "#4ade80",
          soft: "rgba(74,222,128,0.1)",
        },
        amber: {
          DEFAULT: "#fbbf24",
          soft: "rgba(251,191,36,0.1)",
        },
        blue: {
          DEFAULT: "#60a5fa",
          soft: "rgba(96,165,250,0.1)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-ibm-sans)"],
        serif: ["var(--font-libre-baskerville)"],
        mono: ["var(--font-ibm-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
