export interface IExporter {
	icon: string
	name: string
	isDisabled?: () => Promise<boolean> | boolean
	export: () => Promise<void>
}

export class Exporter {
	constructor(protected config: IExporter) {}

	get displayData() {
		return {
			icon: this.config.icon,
			name: this.config.name,
		}
	}

	isDisabled() {
		if (typeof this.config.isDisabled === 'function')
			return this.config.isDisabled()
	}

	export() {
		if (typeof this.config.export === 'function')
			return this.config.export()
	}
}
