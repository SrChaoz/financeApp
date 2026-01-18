/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Zinc Scale (Neutrals)
                background: 'hsl(var(--background))',
                surface: 'hsl(var(--surface))',
                border: 'hsl(var(--border))',
                foreground: 'hsl(var(--foreground))',
                muted: 'hsl(var(--muted))',

                // Primary Accent (TRUE INDIGO - NO PURPLE!)
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },

                // Semantic Financial Colors
                income: {
                    DEFAULT: 'hsl(var(--income))',
                    glow: 'rgba(16, 185, 129, 0.4)',
                },
                expense: {
                    DEFAULT: 'hsl(var(--expense))',
                    glow: 'rgba(244, 63, 94, 0.4)',
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                // TRUE INDIGO GRADIENT - NO PURPLE!
                'gradient-primary': 'linear-gradient(135deg, hsl(239 84% 67%) 0%, hsl(239 84% 60%) 100%)',
                'gradient-surface': 'linear-gradient(180deg, rgba(24, 24, 27, 0.8) 0%, rgba(9, 9, 11, 0.9) 100%)',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'zoom-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            },
            animation: {
                'fade-in': 'fade-in 0.3s ease-out',
                'zoom-in': 'zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            },
            boxShadow: {
                // TRUE INDIGO GLOW - NO PURPLE!
                'glow-primary': '0 0 20px -5px hsl(239 84% 67% / 0.4)',
                'glow-income': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
                'glow-expense': '0 0 20px -5px rgba(244, 63, 94, 0.4)',
            }
        },
    },
    plugins: [],
}
