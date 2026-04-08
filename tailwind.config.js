/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      colors: {
        'app-bg': '#F8F5F0',
        'sidebar-bg': '#F1EDE4',
        'card-bg': '#FFFFFF',
        'sage-primary': '#8DA68D',
        'sage-dark': '#6B8F6B',
        'sage-light': '#EDFBF0',
        'cocoa-text': '#3E3631',
        'muted-taupe': '#8C857D',
        'border-warm': '#E8E2D9',
        'tag-obstacle-bg': '#FFF1F1',
        'tag-obstacle-text': '#D16D6D',
        'tag-obstacle-border': '#FAD2D2',
        'tag-process-bg': '#F1F9F1',
        'tag-process-text': '#6D8F6D',
        'tag-process-border': '#D2EAD2',
        'tag-retro-bg': '#F5F1FF',
        'tag-retro-text': '#8D7BCC',
        'tag-retro-border': '#E2D9F7',
      },
      boxShadow: {
        'soft-glow': '0 4px 20px -5px rgba(141, 166, 141, 0.15)',
        'card-hover': '0 10px 25px -10px rgba(62, 54, 49, 0.08)',
      },
    },
  },
  plugins: [],
}
