/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: 'var(--theme-color-primary)',

				accent: 'var(--theme-color-accent)',
				'accent-secondary': 'var(--theme-color-accentSecondary)',

				background: 'var(--theme-color-background)',
				'background-secondary': 'var(--theme-color-backgroundSecondary)',
				'background-tertiary': 'var(--theme-color-backgroundTertiary)',

				text: 'var(--theme-color-text)',
				'text-secondary': 'var(--theme-color-textSecondary)',

				behaviorPack: 'var(--theme-color-behaviorPack)',
				resourcePack: 'var(--theme-color-resourcePack)',
				skinPack: 'var(--theme-color-skinPack)',
				worldTemplate: 'var(--theme-color-worldTemplate)',

				warning: 'var(--theme-color-warning)',
				info: 'var(--theme-color-info)',
				error: 'var(--theme-color-error)',
				success: 'var(--theme-color-success)',

				toolbar: 'var(--theme-color-toolbar)',
			},
			height: {
				toolbar: '1.5rem',
				app: 'calc(100vh - 1.5rem)',
			},
			spacing: {
				toolbar: '1.5rem',
			},
			boxShadow: {
				window: '0 0 16px -2px rgb(0, 0, 0, 0.4)',
			},
			fontFamily: {
				inter: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
			},
		},
	},
	plugins: [],
}
