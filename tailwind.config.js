/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#effcfa",
          100: "#c8f6ee",
          200: "#96ecdf",
          300: "#5fdcca",
          400: "#33c3b1",
          500: "#17a696",
          600: "#0f766e",
          700: "#0d5f59",
          800: "#0f4b47",
          900: "#0f3d3a",
        },
        accent: {
          50: "#fff1f2",
          100: "#ffe0e3",
          200: "#ffc6cc",
          300: "#ff9ba7",
          400: "#fb7185",
          500: "#f34d68",
          600: "#df2f4e",
          700: "#bc203e",
          800: "#9c1e3a",
          900: "#851d37",
        },
        warm: {
          50: "#fdfbf8",
          100: "#f8f3ec",
          200: "#f0e7d9",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(15, 61, 58, 0.08), 0 8px 24px -8px rgba(15, 61, 58, 0.10)",
        lift: "0 4px 14px -4px rgba(15, 61, 58, 0.14), 0 16px 32px -12px rgba(15, 61, 58, 0.16)",
      },
    },
  },
  plugins: [],
};
