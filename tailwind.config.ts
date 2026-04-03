import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      colors: {
        'retro-green': '#00ff41',
        'retro-dark': '#0a0a0a',
        'retro-panel': '#0d1117',
        'retro-border': '#1a3a1a',
        'retro-hit': '#ff4141',
        'retro-miss': '#1a4a6a',
        'retro-ship': '#2a6a2a',
        'retro-water': '#071520',
        'retro-hover': '#00ff4130',
      },
      boxShadow: {
        'retro-glow': '0 0 10px #00ff41, 0 0 20px #00ff4180',
        'retro-hit-glow': '0 0 10px #ff4141, 0 0 20px #ff414180',
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'explosion': 'explosion 0.5s ease-out forwards',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 5px #00ff41' },
          '50%': { boxShadow: '0 0 20px #00ff41, 0 0 40px #00ff4150' },
        },
        explosion: {
          '0%': { transform: 'scale(0.5)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
