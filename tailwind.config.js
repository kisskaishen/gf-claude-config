/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#fc4c02",
          light: "rgb(252 76 2 / 10%)",
          hover: "#ff6a42"
        },
        success: "#00b578",
        warning: "#ff9811",
        danger: "#ff3141",
        info: "#7a869a",
        text: {
          primary: "#fc4c02",
          regular: "#354250",
          secondary: "#4e5969",
          tertiary: "#7a869a",
          placeholder: "#bbbdbf"
        },
        border: {
          DEFAULT: "#eff0f5",
          light: "#eff0f5",
          form: "#ff8755"
        },
        bg: {
          DEFAULT: "#f6f7fb",
          overlay: "#e6e8eb",
          light: "#eff0f5",
          white: "#fff"
        }
      },
      fontSize: {
        xl: "24px",
        lg: "20px",
        md: "18px",
        base: "16px",
        sm: "14px",
        xs: "12px"
      },
      fontWeight: {
        regular: 400,
        medium: 500,
        bold: 700
      },
      lineHeight: {
        base: 1.5,
        heading: 1.4
      },
      spacing: {
        sidebar: "248px",
        header: "42px",
        tags: "40px"
      }
    }
  },
  plugins: []
};
