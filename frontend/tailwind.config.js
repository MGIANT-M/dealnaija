export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc070',
          400: '#ff9a37',
          500: '#ff7a0f',
          600: '#f05f05',
          700: '#c74606',
          800: '#9e380d',
          900: '#7f300e',
        },
        earth: {
          50: '#f9f6f0',
          100: '#ede5d5',
          200: '#d9c9ab',
          300: '#c2a87b',
          400: '#ae8b55',
          500: '#9d7744',
          600: '#866039',
          700: '#6c4c30',
          800: '#5a402a',
          900: '#4d3726',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      }
    }
  },
  plugins: []
}
