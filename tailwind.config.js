/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        petal: "#E95670",
        roseMist: "#FFE8ED",
        plum: "#3B2331",
        ink: "#1F2937",
        cream: "#FFF9F5",
        mint: "#BFE7D2",
        sky: "#B8D9FF",
        amber: "#F8C46A"
      }
    }
  },
  plugins: []
};
