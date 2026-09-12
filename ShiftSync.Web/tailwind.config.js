/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{ts,tsx,js,jsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // --- Primary (ShiftSync teal/blue brand) ---
                'primary': '#3B82F6',
                'on-primary': '#FFFFFF',
                'primary-container': '#1D4ED8',
                'on-primary-container': '#EFF6FF',

                // --- Secondary ---
                'secondary': '#10B981',
                'on-secondary': '#FFFFFF',
                'secondary-container': '#065F46',
                'on-secondary-container': '#D1FAE5',

                // --- Backgrounds & Surfaces (Deep Navy) ---
                'background': '#0b1326',
                'on-background': '#F5F5F7',
                'surface': '#0b1326',
                'on-surface': '#F5F5F7',
                'surface-dim': '#0b1326',
                'surface-bright': '#31394e',
                'surface-tint': '#3B82F6',
                'surface-variant': '#2d3449',
                'on-surface-variant': '#c2c6d6',
                'surface-container-lowest': '#060d20',
                'surface-container-low': '#131b2e',
                'surface-container': '#171f33',
                'surface-container-high': '#222a3e',
                'surface-container-highest': '#2d3449',
                'inverse-surface': '#F5F5F7',
                'inverse-on-surface': '#171f33',
                'inverse-primary': '#3B82F6',

                // --- Outlines & Borders ---
                'outline': '#8c909f',
                'outline-variant': '#424754',

                // --- Feedback / Error States ---
                'error': '#f87171',
                'on-error': '#450a0a',
                'error-container': '#7f1d1d',
                'on-error-container': '#fecaca',

                // --- Accent Colors ---
                'accent-cyan': '#00F2FF',
                'accent-pink': '#EC4899',
                'accent-purple': '#8B5CF6',
                'accent-orange': '#F97316',
                'accent-yellow': '#EAB308',
                'accent-green': '#10B981',
                'accent-red': '#EF4444',

                // --- Dashboard specific ---
                'dashboard-bg': '#0b1326',
                'card-bg': 'rgba(30, 41, 59, 0.6)',
            },
            borderRadius: {
                'DEFAULT': '0.375rem',
                'lg': '0.5rem',
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
                'full': '9999px',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                headline: ['Inter', 'system-ui', 'sans-serif'],
                body: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'subtle-float': 'subtle-float 3s ease-in-out infinite',
                'fadeIn': 'fadeIn 0.2s ease-out',
                'scaleUp': 'scaleUp 0.2s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                'glow-pulse': {
                    '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
                    '50%': { opacity: '0.8', filter: 'brightness(1.5)' },
                },
                'subtle-float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                'fadeIn': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'scaleUp': {
                    from: { opacity: '0', transform: 'scale(0.95)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                'slideIn': {
                    from: { opacity: '0', transform: 'translateY(-8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};
