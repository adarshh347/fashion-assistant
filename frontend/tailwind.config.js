/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                metallic: {
                    100: '#e0e0e0',
                    200: '#c0c0c0',
                    300: '#a0a0a0',
                    400: '#808080',
                    500: '#606060',
                    600: '#404040',
                    700: '#202020',
                    800: '#101010',
                    900: '#000000',
                }
            },
            backgroundImage: {
                'metallic-gradient': 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 50%, #e0e0e0 100%)',
                'metallic-dark': 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
            }
        },
    },
    plugins: [],
}
