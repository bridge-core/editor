import json5 from 'json5'
import { transformOldModels } from '../transformOldModels'
import { RenderDataContainer } from './RenderContainer'
import { FileWatcher } from './FileWatcher'

export class GeometryData extends FileWatcher {
	protected geometryJson: any
	protected selected!: string

	constructor(
		protected parent: RenderDataContainer,
		geometryFilePath: string,
		protected includedGeometryIdentifiers?: string[]
	) {
		super(parent.app, geometryFilePath)
	}

	select(id: string) {
		this.selected = id
	}

	async onChange(file: File, isInitial = false) {
		try {
			this.geometryJson = transformOldModels(
				json5.parse(await file.text())
			)
			if (!isInitial) this.parent.onChange()
		} catch {
			// If parsing JSON fails, do nothing
		}
	}

	get includedGeometries(): any[] {
		if (this.includedGeometryIdentifiers === undefined)
			return this.geometryJson['minecraft:geometry']

		return this.geometryJson['minecraft:geometry'].filter(
			({ description }: any) =>
				!this.includedGeometryIdentifiers!.includes(
					description.identifier
				)
		)
	}

	get identifiers(): string[] {
		return this.includedGeometries.map(
			({ description }) => description.identifier
		)
	}
	get geometry() {
		return (
			this.includedGeometries.find(
				({ description }) => description.identifier === this.selected
			) ?? this.includedGeometries[0]
		)
	}
}
