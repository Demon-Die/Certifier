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
      colors: {
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'oklch(var(--primary))',
          foreground: 'oklch(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary))',
          foreground: 'oklch(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'oklch(var(--muted))',
          foreground: 'oklch(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'oklch(var(--accent))',
          foreground: 'oklch(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive))',
          foreground: 'oklch(var(--destructive-foreground))',
        },
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring))',
        success: '#4ade80',
        warning: '#f7b955',
        cyan: '#60e6d9',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['clamp(2rem, 5vw, 3.5rem)', { lineHeight: '1.1', fontWeight: '700' }],
        headline: ['1.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        'headline-sm': ['1.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'body-sm': ['0.75rem', { lineHeight: '1.5' }],
        'label-mono': [
          '0.8125rem',
          { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.05em' },
        ],
        'code-sm': ['0.75rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        DEFAULT: '0rem',
        lg: '0rem',
        xl: '0rem',
        '2xl': '0rem',
        full: '9999px',
      },
      spacing: {
        gutter: '24px',
        'gutter-mobile': '16px',
        'section-gap': '64px',
      },
      maxWidth: {
        'container-max': '1280px',
        'container-narrow': '768px',
      },
      boxShadow: {
        'glow-primary': '0 0 8px rgba(255, 49, 49, 0.3)',
        'glow-primary-lg': '0 0 15px rgba(255, 49, 49, 0.5)',
        'glow-cyan': '0 0 8px rgba(96, 230, 217, 0.3)',
        nav: '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 4px rgba(255, 49, 49, 0.3)' },
          '50%': { boxShadow: '0 0 12px rgba(255, 49, 49, 0.6)' },
        },
        flicker: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.97' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        flicker: 'flicker 0.15s infinite',
      },
    },
  },
  plugins: [],
};
export default config;
