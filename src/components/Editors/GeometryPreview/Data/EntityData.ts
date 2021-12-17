import json5 from 'json5'
import { PreviewFileWatcher } from './PreviewFileWatcher'
import { RenderDataContainer } from './RenderContainer'
import { walkObject } from 'bridge-common-utils'

export interface IOutlineBox {
	color: `#${string}`
	position: { x: number; y: number; z: number }
	size: { x: number; y: number; z: number }
}

export class EntityData extends PreviewFileWatcher {
	protected entityData: any = {}

	constructor(protected parent: RenderDataContainer, filePath: string) {
		super(parent.app, filePath)
	}

	async onChange(file: File, isInitial = false) {
		try {
			this.entityData = json5.parse(await file.text())

			if (!isInitial) this.parent.onChange()
		} catch {
			// If parsing JSON fails, do nothing
		}
	}

	findComponent(id: string) {
		const components: any[] = []
		const onReach = (data: any) => components.push(data)
		const locations = [`*/components/${id}`, `*/component_groups/*/${id}`]
		locations.forEach((loc) => walkObject(loc, this.entityData, onReach))

		return components
	}

	getSeatBoxHelpers() {
		const components = this.findComponent('minecraft:rideable')

		const playerSize = <const>{ x: 16 * 0.8, y: 16 * 1.8, z: 16 * 0.8 }

		return components
			.map((rideable) => rideable?.seats ?? [])
			.flat()
			.map((seat) => seat?.position)
			.filter(
				(position) =>
					Array.isArray(position) &&
					typeof position[0] === 'number' &&
					typeof position[1] === 'number' &&
					typeof position[2] === 'number'
			)
			?.map(
				(position) =>
					<const>{
						color: '#ff0000',
						position: {
							x: position[0] * -16,
							y: position[1] * 16,
							z: position[2] * -16,
						},
						size: playerSize,
					}
			)
	}

	getCollisionBoxes() {
		return this.findComponent('minecraft:collision_box')
			.filter(
				(collisionBox) =>
					typeof collisionBox?.width === 'number' &&
					typeof collisionBox?.height === 'number'
			)
			.map(
				(collisionBox) =>
					<const>{
						color: '#ffff00',
						position: { x: 0, y: 0, z: 0 },
						size: {
							x: collisionBox.width * 16,
							y: collisionBox.height * 16,
							z: collisionBox.width * 16,
						},
					}
			)
	}

	getHitboxes() {
		return this.findComponent('minecraft:custom_hit_test')
			.map((customHitTest) => customHitTest?.hitboxes ?? [])
			.flat()
			.filter(
				(hitbox) =>
					typeof hitbox?.width === 'number' &&
					typeof hitbox?.height === 'number' &&
					(hitbox?.pivot === undefined ||
						(Array.isArray(hitbox?.pivot) &&
							typeof hitbox.pivot[0] === 'number' &&
							typeof hitbox.pivot[1] === 'number' &&
							typeof hitbox.pivot[2] === 'number'))
			)
			.map(
				(hitbox) =>
					<const>{
						color: '#0000ff',
						position: {
							x: (hitbox?.pivot?.[0] ?? 0) * -16,
							y:
								((hitbox?.pivot?.[1] ?? 0) -
									hitbox.height / 2) *
								16,
							z: (hitbox?.pivot?.[2] ?? 0) * -16,
						},
						size: {
							x: hitbox.width * 16,
							y: hitbox.height * 16,
							z: hitbox.width * 16,
						},
					}
			)
	}
}
