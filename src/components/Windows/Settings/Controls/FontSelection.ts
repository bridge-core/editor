import { ISelectionControl, Selection } from './Selection/Selection'

export class FontSelection extends Selection {
	protected didLoadFonts = false
	constructor(config: ISelectionControl<string>) {
		super(config)

		config.onClick = () => this.onClick()
	}

	onClick() {
		if (!window.queryLocalFonts || this.didLoadFonts) return

		window
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
