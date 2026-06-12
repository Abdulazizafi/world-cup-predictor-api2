import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Official FIFA WC26 palette extracted from the logo
        wc: {
          red:       '#C1001A', // FIFA crimson red
          purple:    '#6B3FA0', // lavender purple
          orange:    '#E8531A', // burnt orange
          teal:      '#007A6E', // dark teal
          lime:      '#8DC63F', // yellow-green
          cyan:      '#009A9A', // mid cyan
          maroon:    '#8B0000', // deep maroon
          violet:    '#4A2C6E', // deep violet
          white:     '#FFFFFF',
        },
      },
      backgroundImage: {
        // WC26 concentric arch stripe pattern
        'wc-stripes': `
          repeating-linear-gradient(
            135deg,
            #C1001A 0px, #C1001A 40px,
            #E8531A 40px, #E8531A 80px,
            #6B3FA0 80px, #6B3FA0 120px,
            #007A6E 120px, #007A6E 160px,
            #8DC63F 160px, #8DC63F 200px,
            #009A9A 200px, #009A9A 240px,
            #4A2C6E 240px, #4A2C6E 280px
          )
        `,
        'wc-radial': `
          radial-gradient(ellipse 70% 60% at 50% 0%, rgba(193,0,26,0.15) 0%, transparent 70%),
          radial-gradient(ellipse 50% 40% at 80% 80%, rgba(107,63,160,0.1) 0%, transparent 60%)
        `,
      },
      animation: {
        'spin-slow':  'spin 3s linear infinite',
        'pulse-dot':  'pulse-dot 1.2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'stripe-move':'stripe-move 8s linear infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(1.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'stripe-move': {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '280px 0' },
        },
      },
      boxShadow: {
        'wc-red':    '0 0 30px rgba(193,0,26,0.5)',
        'wc-purple': '0 0 30px rgba(107,63,160,0.4)',
        'wc-teal':   '0 0 30px rgba(0,122,110,0.4)',
        'card':      '0 4px 32px rgba(0,0,0,0.5)',
        'logo':      '0 8px 40px rgba(193,0,26,0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
