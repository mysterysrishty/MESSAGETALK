/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          app: "#0b141a",
          panel: "#111b21",
          header: "#202c33",
          divider: "#2a3942",
          muted: "#8696a0",
          accent: "#00a884",
          outgoing: "#005c4b",
        },
      },
      boxShadow: {
        panel: "0 18px 45px rgba(0, 0, 0, 0.28)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
