/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // allows dark mode toggle with "class"
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#2563EB',
          dark: '#3B82F6',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1F2937',
        },
        background: {
          light: '#F9FAFB',
          dark: '#111827',
        },
        success: {
          light: '#10B981',
          dark: '#34D399',
        },
        danger: {
          light: '#DC2626',
          dark: '#F87171',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

