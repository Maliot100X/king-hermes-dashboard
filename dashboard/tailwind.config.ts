import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // VoltAgent Dark Theme
        abyss: '#050507',
        carbon: '#101010',
        charcoal: '#3d3a39',
        emerald: '#00d992',
        mint: '#2fd6a1',
        snow: '#f2f2f2',
        parchment: '#b8b3b0',
        slate: '#8b949e',
        
        // Agent Brand Colors
        'king-gold': '#FFD700',
        gemini: '#4285F4',
        claude: '#c96442',
        opencode: '#fdfcfc',
        'opencode-bg': '#201d1d',
        roo: '#9B59B6',
        openclaw: '#FF6B35',
      },
      fontFamily: {
        heading: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 217, 146, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 217, 146, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'warm': '0 0 15px rgba(92, 88, 85, 0.2)',
        'dramatic': '0 20px 60px rgba(0, 0, 0, 0.7)',
        'emerald': '0 0 20px rgba(0, 217, 146, 0.4)',
        'gold': '0 0 30px rgba(255, 215, 0, 0.5)',
        'inner-ring': 'inset 0 0 0 1px rgba(148, 163, 184, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
