/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0B0F1A",       // near-black control-room background
        surface: "#131A2A",    // panel surface
        surface2: "#1B2436",   // raised panel / hover
        border: "#232E45",
        muted: "#7C8AAE",      // secondary text
        ink: "#E7ECF7",        // primary text
        flow: "#22D9A8",       // "traffic flowing" teal-green
        caution: "#F5A623",    // amber, matches traffic signal amber
        congest: "#EF4C54",    // red, congestion/alert
        signal: "#4C8DFF",     // info blue accent
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};
