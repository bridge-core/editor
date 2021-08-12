import { Exporter } from './Exporter'
import { IActionConfig } from '/@/components/Actions/SimpleAction'

/**
 * A class that stores exporters registered by extensions
 */
export class ExportProvider {
	protected exports = new Set<Exporter>()

	/**
	 * Register an exporter
	 *
	 * @param exporter An exporter provided by an extension
	 * @returns a disposable that unregisters the exporter
	 */
	public register(exporter: Exporter) {
		this.exports.add(exporter)

		return {
			dispose: () => this.exports.delete(exporter),
		}
	}

	public async getExporters(): Promise<IActionConfig[]> {
		return await Promise.all(
			[...this.exports].map(async (exporter) => ({
				...exporter.displayData,
				isDisabled: await exporter.isDisabled(),
				onTrigger: () => exporter.export(),
			}))
		)
	}
}
