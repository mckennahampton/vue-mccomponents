/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        "./lib/**/*.{vue,js,ts}",
        "./src/**/*.{vue,js,ts}",
        "./index.html"
    ],
    theme: {
        extend: {
        animation: {
            'spin-quick': 'spin 1s linear infinite',
            'spin-fast': 'spin 0.4s linear infinite',
            loading: 'loading 2s linear infinite',
        },
        screens: {
            'xs': '390px',
            // => @media (min-width: 390px) { ... }
    
            'sm': '640px',
            // => @media (min-width: 640px) { ... }
    
            'md': '768px',
            // => @media (min-width: 768px) { ... }
    
            'lg': '1024px',
            // => @media (min-width: 1024px) { ... }
    
            'xl': '1280px',
            // => @media (min-width: 1280px) { ... }
    
            '2xl': '1536px',
            // => @media (min-width: 1536px) { ... }
        }
        },
    },
    plugins: [
        require('tailwind-scrollbar'),
    ],
}

