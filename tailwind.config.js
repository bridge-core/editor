/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: 'var(--theme-color-primary)',
				background: 'var(--theme-color-background)',

				menu: 'var(--theme-color-menu)',
				menuAlternate: 'var(--theme-color-menuAlternate)',

				text: 'var(--theme-color-text)',
				textAlternate: 'var(--theme-color-textAlternate)',

				toolbar: 'var(--theme-color-toolbar)',

				behaviorPack: 'var(--theme-color-behaviorPack)',
				resourcePack: 'var(--theme-color-resourcePack)',
				skinPack: 'var(--theme-color-skinPack)',
				worldTemplate: 'var(--theme-color-worldTemplate)',

				warning: 'var(--theme-color-warning)',
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
