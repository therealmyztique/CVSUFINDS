/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2bee79",
          dark: "#1fa855",
        },
        background: {
          light: "#f6f8f7",
          dark: "#0b1610",
        },
        surface: {
          light: "#ffffff",
          dark: "#12251a",
          "dark-alt": "#1a3022",
        },
        text: {
          light: "#0f172a",
          dark: "#f8fafc",
        },
        muted: {
          light: "#64748b",
          dark: "#94a3b8",
        },
        error: {
          light: "#b91c1c",
          dark: "#fca5a5",
        },
        lost: {
          light: "#f43f5e",
          dark: "#fb7185",
        },
        found: {
          light: "#2bee79",
          dark: "#2bee79",
        },
      },
    },
  },
  plugins: [],
};
