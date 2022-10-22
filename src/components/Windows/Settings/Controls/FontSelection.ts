import { ISelectionControl, Selection } from './Selection/Selection'

export class FontSelection extends Selection {
	protected didLoadFonts = false
	constructor(config: ISelectionControl<string>) {
		super(config)

		config.onClick = () => this.onClick()

		if (typeof navigator?.permissions?.query === 'function')
			// Try to load fonts if permission was already granted
			navigator.permissions
				// @ts-ignore
				.query({ name: 'local-fonts' })
				.then(({ state }) => {
					if (state === 'granted') this.onClick()
				})
				.catch(() => {})
	}

	async onClick() {
		if (!window.queryLocalFonts || this.didLoadFonts) return

		await window
			.queryLocalFonts()
			.then((fonts) => {
				this.didLoadFonts = true

				this.config.options.push(
					...fonts
						.filter((font) => font.style === 'Regular')
						.map((font) => ({
							text: font.fullName,
							value: font.family,
						}))
				)
			})
			.catch((err) => console.error(err))
	}
}
