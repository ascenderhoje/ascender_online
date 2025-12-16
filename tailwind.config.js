/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ascender: {
          purple: {
            light: '#C8A8E9',
            DEFAULT: '#4B0082',
            dark: '#3A0066',
          },
          yellow: {
            light: '#FFE07D',
            DEFAULT: '#FFC700',
            dark: '#E6B300',
          },
          neutral: {
            light: '#F5F3F1',
            DEFAULT: '#E8E4E1',
            dark: '#D1CCC7',
          },
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'title': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'subtitle': ['21px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
