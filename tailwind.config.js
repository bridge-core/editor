/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			keyframes: {
				'fade-in': {
					'0%': { opacity: '0%' },
					'100%': { opacity: '100%' },
				},
				'scale-up': {
					'0%': { transform: 'scale(0.5)' },
					'95%': { transform: 'scale(1.05)' },
					'100%': { transform: 'scale(1)' },
				},
				'fade-out': {
					'0%': { opacity: '100%' },
					'100%': { opacity: '0%' },
				},
				'scale-down': {
					'0%': { transform: 'scale(1)' },
					'100%': { transform: 'scale(0.5)' },
				},
			},
			animation: {
				'fade-in': 'fade-in 0.15s ease-in-out',
				'scale-up': 'scale-up 0.15s ease-in-out',
				'fade-in-and-scale-up':
					'fade-in 0.15s ease-in-out, scale-up 0.15s ease-in-out',
				'fade-out': 'fade-out 0.15s ease-in-out',
				'scale-down': 'scale-down 0.15s ease-in-out',
				'fade-out-and-scale-down':
					'fade-out 0.15s ease-in-out, scale-down 0.15s ease-in-out',
			},
			backdropBlur: {
				xs: '2px',
			},
			colors: {
				primary: 'var(--v-primary-base)',
			},
		},
	},
	plugins: [],
}
