import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0f',
          card: '#12121a',
          input: '#1a1a24',
          border: '#2a2a3a',
        },
        accent: {
          green: '#10b981',
          red: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
export default config
