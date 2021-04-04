/**
 * An RenderDataContainer instance holds references to all data needed to render a visual preview of an entity/block
 */

import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { App } from '/@/App'
import { GeometryData } from './GeometryData'
import { Signal } from '/@/components/Common/Event/Signal'

export interface IRenderData {
	identifier: string
	texturePaths: string[]
	animationIdentifiers: string[]
}

export class RenderDataContainer extends EventDispatcher<void> {
	protected _geometries: GeometryData[] = []
	protected readyPromises: Promise<void>[] = []
	protected _currentTexturePath = this.texturePaths[0]

	get ready() {
		return Promise.all(this.readyPromises)
	}

	constructor(public readonly app: App, protected renderData: IRenderData) {
		super()
	}
	update(renderData: IRenderData) {
		this.renderData = renderData
	}

	createGeometry(
		geometryFilePath: string,
		includedGeometryIdentifiers?: string[]
	) {
		const geo = new GeometryData(
			this,
			geometryFilePath,
			includedGeometryIdentifiers
		)
		this._geometries.push(geo)
		this.readyPromises.push(geo.fired)
	}
	selectGeometry(id: string) {
		for (const geo of this._geometries) {
			if (geo.identifiers.includes(id)) return geo.select(id)
		}
		throw new Error(`Failed to find geometry with ID "${id}"`)
	}
	selectTexturePath(path: string) {
		this._currentTexturePath = path
	}
	onChange() {
		this.dispatch()
	}

	get identifier() {
		return this.renderData.identifier
	}
	get texturePaths() {
		return this.renderData.texturePaths
	}
	get geometryIdentifiers() {
		return this._geometries.map((geo) => geo.identifiers).flat()
	}
	get animationIdentifiers() {
		return this.renderData.animationIdentifiers
	}
	get modelData() {
		return this._geometries[0].geometry
	}
	get currentTexturePath() {
		return this._currentTexturePath
	}

	activate() {
		this._geometries.forEach((geo) => geo.activate())
	}
	dispose() {
		this._geometries.forEach((geo) => geo.dispose())
	}
}
