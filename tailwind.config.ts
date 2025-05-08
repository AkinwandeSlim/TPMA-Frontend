/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Your current content path
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Added from original to cover all files
  ],
  theme: {
    extend: {
      colors: {
        // Existing colors (unchanged)
        'primary-100': '#E3F2FD', // Banner background
        'primary-500': '#3b82f6', // Sign In button
        'primary-600': '#2a6de1', // Hover shade
        // TPMA dashboard colors (from Safak’s example, unchanged)
        lamaSky: "#C3EBFA",
        lamaSkyLight: "#EDF9FD",
        lamaPurple: "#CFCEFF", // Light purple, but we’ll adjust to match original #5244F3
        lamaPurpleLight: "#F1F0FF",
        lamaYellow: "#FAE27C",
        lamaYellowLight: "#FEFCE8",
        // New blue shades for landing page
        blue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
        },
      },
      backgroundImage: { // Optional, from original config, unchanged
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Optional for landing page, won’t affect other systems
      },
    },
  },
  plugins: [],
};









































// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     './src/**/*.{js,ts,jsx,tsx}', // Your current content path
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Added from original to cover all files
//   ],
//   theme: {
//     extend: {
//       colors: {
//         // Landing page colors (keep these)
//         'primary-100': '#E3F2FD', // Banner background
//         'primary-500': '#3b82f6', // Sign In button
//         'primary-600': '#2a6de1', // Hover shade
//         // TPMA dashboard colors (from Safak’s example)
//         lamaSky: "#C3EBFA",
//         lamaSkyLight: "#EDF9FD",
//         lamaPurple: "#CFCEFF", // Light purple, but we’ll adjust to match original #5244F3
//         lamaPurpleLight: "#F1F0FF",
//         lamaYellow: "#FAE27C",
//         lamaYellowLight: "#FEFCE8",
//       },
//       backgroundImage: { // Optional, from original config
//         "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
//         "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
//       },
//     },
//   },
//   plugins: [],
// };












//  module.exports = {
//   content: [
//     './src/**/*.{js,ts,jsx,tsx}',
//   ],
//   theme: {
//     extend: {
//       colors: {
//         'primary-100': '#E3F2FD', // Keep this for the Banner background
//         'primary-500': '#3b82f6', // Match the Sign In button
//         'primary-600': '#2a6de1', // Darker shade for hover
//       },
//     },
//   },
//   plugins: [],
// };






// import type { Config } from "tailwindcss";

// const config: Config = {
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       backgroundImage: {
//         "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
//         "gradient-conic":
//           "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
//       },
//       colors: {
//         lamaSky: "#C3EBFA",
//         lamaSkyLight: "#EDF9FD",
//         lamaPurple: "#CFCEFF",
//         lamaPurpleLight: "#F1F0FF",
//         lamaYellow: "#FAE27C",
//         lamaYellowLight: "#FEFCE8",
//       },
//     },
//   },
//   plugins: [],
// };
// export default config;
