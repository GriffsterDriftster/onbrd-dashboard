import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { colors: { brand: { DEFAULT: '#0b468c', fg: '#ffffff' } } } },
  plugins: [],
} satisfies Config;