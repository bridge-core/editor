import json5 from 'json5'
import { PreviewFileWatcher } from './PreviewFileWatcher'
import { RenderDataContainer } from './RenderContainer'

export class ParticleData extends PreviewFileWatcher {
	protected particleData: any

	constructor(
		protected parent: RenderDataContainer,
		public readonly shortName: string | undefined,
		particleFilePath: string
	) {
		super(parent.app, particleFilePath)
	}

	async onChange(file: File, isInitial = false) {
		try {
			this.particleData = json5.parse(await file.text())
			if (!isInitial) this.parent.onChange()
		} catch {
			// If parsing JSON fails, do nothing
		}
	}

	get identifier(): string | undefined {
		return this.particleData?.particle_effect?.description?.identifier
	}
	get json() {
		return this.particleData
	}
}
