import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "sans-serif"],
      },
      colors: {
        canvas: "var(--canvas-bg)",
        shell: "var(--shell-bg)",
        card: {
          DEFAULT: "var(--card-bg)",
          subtle: "var(--card-subtle)",
          dashed: "var(--card-dashed)",
        },
        brand: {
          purple: "var(--brand-purple)",
          "purple-hover": "var(--brand-purple-hover)",
          "purple-light": "var(--brand-purple-light)",
          navy: "var(--brand-navy)",
          "navy-hover": "var(--brand-navy-hover)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          "on-purple": "var(--text-on-purple)",
          "on-navy": "var(--text-on-navy)",
        },
        border: {
          light: "var(--border-light)",
          focus: "var(--border-focus)",
        },
        status: {
          success: {
            bg: "var(--status-success-bg)",
            text: "var(--status-success-text)",
            dot: "var(--status-success-dot)",
          },
          warning: {
            bg: "var(--status-warning-bg)",
            text: "var(--status-warning-text)",
            dot: "var(--status-warning-dot)",
          },
          danger: {
            bg: "var(--status-danger-bg)",
            text: "var(--status-danger-text)",
            dot: "var(--status-danger-dot)",
          },
          info: {
            bg: "var(--status-info-bg)",
            text: "var(--status-info-text)",
            dot: "var(--status-info-dot)",
          },
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        shell: "var(--radius-shell)",
      },
      boxShadow: {
        shell: "var(--shadow-shell)",
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

