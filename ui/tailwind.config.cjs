module.exports = {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
      extend: {
        colors: {
          bg: '#05060b',
          card: '#0b0d16',
          cardOutline: '#1b2133',
          accent: '#4da3ff',
          accentSoft: '#10243d',
          success: '#21c55d',
        },
        fontFamily: {
          mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        },
      },
    },
    plugins: [],
  };