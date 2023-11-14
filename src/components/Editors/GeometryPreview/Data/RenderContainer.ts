/**
 * An RenderDataContainer instance holds references to all data needed to render a visual preview of an entity/block
 */

import { EventDispatcher } from '../../../../libs/event/EventDispatcher'
import { App } from '/@/App'
import { GeometryData } from './GeometryData'
import { AnimationData } from './AnimationData'
import { ParticleData } from './ParticleData'
import { EntityData } from './EntityData'

export interface IRenderData {
	identifier: string
	texturePaths: string[]
	connectedAnimations: Set<string>
}

export class RenderDataContainer extends EventDispatcher<void> {
	protected _geometries: GeometryData[] = []
	protected _animations: AnimationData[] = []
	protected readyPromises: Promise<void>[] = []
	protected _currentTexturePath: string
	protected _runningAnimations = new Set<string>()
	protected particleEffects: ParticleData[] = []
	protected _serverEntity?: EntityData

	get ready() {
		return Promise.all(this.readyPromises)
	}

	constructor(public readonly app: App, protected renderData: IRenderData) {
		super()
		this._currentTexturePath = this.texturePaths[0]
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
		this.readyPromises.push(geo.ready.fired)
	}
	createAnimation(
		animationFilePath: string,
		includedAnimationIdentifiers?: string[]
	) {
		const anim = new AnimationData(
			this,
			animationFilePath,
			includedAnimationIdentifiers
		)
		this._animations.push(anim)
		this.readyPromises.push(anim.ready.fired)
	}
	createParticle(shortName: string | undefined, particleFilePath: string) {
		const particle = new ParticleData(this, shortName, particleFilePath)
		this.particleEffects.push(particle)
		this.readyPromises.push(particle.ready.fired)
	}
	addServerEntity(filePath: string) {
		this._serverEntity = new EntityData(this, filePath)
		this.readyPromises.push(this._serverEntity.ready.fired)
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
	get animations() {
		return this._animations
			.map((anim) => anim.includedAnimations)
			.flat()
			.filter(([anim]) => this.renderData.connectedAnimations.has(anim))
	}
	get runningAnimations() {
		return this._runningAnimations
	}
	get modelData() {
		for (const geo of this._geometries) {
			let currGeo = geo.geometry
			if (currGeo) return currGeo
		}

		return this._geometries[0].fallbackGeometry
	}
	get currentTexturePath() {
		return this._currentTexturePath
	}
	get particles() {
		return this.particleEffects.map(
			(effect) => <const>[effect.shortName, effect.json]
		)
	}
	get serverEntity() {
		return this._serverEntity
	}

	activate() {
		this._geometries.forEach((geo) => geo.activate())
	}
	dispose() {
		this._geometries.forEach((geo) => geo.dispose())
		this._animations.forEach((anim) => anim.dispose())
		this._serverEntity?.dispose()
	}
}
