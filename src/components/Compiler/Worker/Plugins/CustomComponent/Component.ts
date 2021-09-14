import { compare } from 'compare-versions'
import { v1Compat } from './v1Compat'
import { run } from '/@/components/Extensions/Scripts/run'
import { deepMerge } from '/@/utils/deepmerge'
import { hashString } from '/@/utils/hash'

export type TTemplate = (componentArgs: any, opts: any) => any

export class Component {
	protected _name?: string
	protected schema?: any
	protected template?: TTemplate
	protected animations: [any, string | false | undefined][] = []
	protected animationControllers: [any, string | false | undefined][] = []
	protected createOnPlayer: [string, any][] = []
	protected dialogueScenes: any[] = []
	protected clientFiles: Record<string, any> = {}

	constructor(
		protected fileType: string,
		protected componentSrc: string,
		protected mode: 'build' | 'dev',
		protected v1Compat: boolean,
		protected targetVersion?: string
	) {}

	//#region Getters
	get name() {
		return this._name
	}
	//#endregion

	async load(type?: 'server' | 'client') {
		const module = { exports: {} }
		try {
			run({
				script: this.componentSrc,
				env: {
					module: module,
					defineComponent: (x: any) => x,
					Bridge: this.v1Compat
						? v1Compat(module, this.fileType)
						: undefined,
				},
			})
		} catch (err) {
			console.error(err)
		}

		if (typeof module.exports !== 'function') return false

		const name = (name: string) => (this._name = name)
		let schema: Function = (schema: any) => (this.schema = schema)
		let template: Function = () => {}
		if (!type || type === 'server') {
			schema = () => {}
			template = (func: TTemplate) => {
				this.template = (componentArgs: any, opts: any) => {
					try {
						func(componentArgs, opts)
					} catch (err) {
						console.error(err)
					}
				}
			}
		}

		await module.exports({
			name,
			schema,
			template,
		})
		return true
	}
	reset() {
		// Clear previous animation (controllers)
		this.animations = []
		this.animationControllers = []
	}

	getSchema() {
		return this.schema
	}
	toString() {
		return this.componentSrc
	}

	create(
		fileContent: any,
		template: any,
		location = `minecraft:${this.fileType}`
	) {
		const keys = location.split('/')
		const lastKey = keys.pop()!

		let current = this.getObjAtLocation(fileContent, keys.join('/'))

		current[lastKey] = deepMerge(current[lastKey] ?? {}, template ?? {})
	}
	protected getObjAtLocation(fileContent: any, location: string) {
		const keys = location.split('/')
		let current: any = fileContent

		while (keys.length > 0) {
			const key = keys.shift()!

			if (current[key] === undefined) {
				if (current[Number(key)] !== undefined) {
					current = current[Number(key)]
				} else {
					current[key] = {}
					current = current[key]
				}
			} else {
				current = current[key]
			}
		}

		return current
	}

	async processTemplates(
		fileContent: any,
		componentArgs: any,
		location: string
	) {
		if (typeof this.template !== 'function') return

		// Try getting file identifier
		const identifier: string =
			fileContent[`minecraft:${this.fileType}`]?.description
				?.identifier ?? 'bridge:no_identifier'
		// Used to compose the animation (controller) short name so the user knows how to reference their animation (controller)
		const fileName = await hashString(`${this.name}/${identifier}`)

		// Setup animation/animationController helper
		const animation = (animation: any, molangCondition?: string) => {
			this.animations.push([animation, molangCondition])
			return this.getShortAnimName(
				'a',
				fileName,
				this.animations.length - 1
			)
		}

		const animationController = (
			animationController: any,
			molangCondition?: string
		) => {
			this.animationControllers.push([
				animationController,
				molangCondition,
			])
			return this.getShortAnimName(
				'ac',
				fileName,
				this.animationControllers.length - 1
			)
		}

		const permutationEventName = (
			await hashString(`${this.name}/${location}`)
		).slice(0, 16)
		const onActivated = (eventResponse: any) =>
			this.registerLifecycleHook(
				fileContent,
				location,
				eventResponse,
				permutationEventName,
				'activated'
			)
		const onDeactivated = (eventResponse: any) =>
			this.registerLifecycleHook(
				fileContent,
				location,
				eventResponse,
				permutationEventName,
				'deactivated'
			)

		// Execute template function with context for current fileType
		if (this.fileType === 'entity') {
			this.template(componentArgs ?? {}, {
				// @deprecated remove with next major version
				mode: this.mode,
				compilerMode: this.mode,
				sourceEntity: () => JSON.parse(JSON.stringify(fileContent)),
				create: (template: any, location?: string) =>
					this.create(fileContent, template, location),
				location,
				identifier,
				animationController,
				animation,
				dialogueScene:
					!this.targetVersion ||
					compare(this.targetVersion, '1.17.10', '>=')
						? (scene: any, openDialogue = true) => {
								this.dialogueScenes.push(scene)

								if (scene.scene_tag && openDialogue)
									onActivated({
										run_command: {
											command: [
												`/dialogue open @s @p ${scene.scene_tag}`,
											],
										},
									})
						  }
						: undefined,
				onActivated,
				onDeactivated,
				client: {
					create: (clientEntity: any, formatVersion = '1.10.0') => {
						this.clientFiles[
							`RP/entity/bridge/${fileName}.json`
						] = {
							format_version: formatVersion,
							'minecraft:client_entity': Object.assign(
								{
									description: {
										identifier,
									},
								},
								clientEntity
							),
						}
					},
				},
			})
		} else if (this.fileType === 'item') {
			this.template(componentArgs ?? {}, {
				// @deprecated remove with next major version
				mode: this.mode,
				compilerMode: this.mode,
				sourceItem: () => JSON.parse(JSON.stringify(fileContent)),
				create: (template: any, location?: string) =>
					this.create(fileContent, template, location),
				location,
				identifier,
				player: {
					animationController,
					animation,
					create: (template: any, location?: string) =>
						this.createOnPlayer.push([
							location ?? `minecraft:entity`,
							template,
						]),
				},
			})
		} else if (this.fileType === 'block') {
			this.template(componentArgs ?? {}, {
				// @deprecated remove with next major version
				mode: this.mode,
				sourceBlock: this.mode,
				fileContent: () => JSON.parse(JSON.stringify(fileContent)),
				create: (template: any, location?: string) =>
					this.create(fileContent, template, location),
				location,
				identifier,
			})
		}
	}

	async processAdditionalFiles(fileContent: any) {
		// Try getting file identifier
		const identifier =
			fileContent[`minecraft:${this.fileType}`]?.description
				?.identifier ?? 'bridge:no_identifier'

		const fileName = await hashString(`${this.name}/${identifier}`)
		const animFileName = `BP/animations/bridge/${fileName}.json`
		const animControllerFileName = `BP/animation_controllers/bridge/${fileName}.json`

		if (identifier === 'minecraft:player') {
			this.createOnPlayer.forEach(([location, template]) => {
				this.create(fileContent, template, location)
			})
		}

		return {
			[animFileName]: this.createAnimations(fileName, fileContent),
			[animControllerFileName]: this.createAnimationControllers(
				fileName,
				fileContent
			),
			[`BP/dialogue/bridge/${fileName}.json`]:
				this.dialogueScenes.length > 0
					? JSON.stringify(
							{
								format_version: this.targetVersion,
								'minecraft:npc_dialogue': {
									scenes: this.dialogueScenes,
								},
							},
							null,
							'\t'
					  )
					: undefined,
			...Object.fromEntries(
				Object.entries(
					this.clientFiles
				).map(([filePath, jsonContent]) => [
					filePath,
					JSON.stringify(jsonContent, null, '\t'),
				])
			),
		}
	}

	protected createAnimations(fileName: string, fileContent: any) {
		if (this.animations.length === 0) return

		let id = 0
		const animations: any = { format_version: '1.10.0', animations: {} }

		for (const [anim, condition] of this.animations) {
			if (!anim) {
				id++
				continue
			}

			// Create unique animId
			const animId = this.getAnimName('animation', fileName, id)
			// Create shorter reference to animId that's unique per entity
			const shortAnimId = this.getShortAnimName('a', fileName, id)

			// Save animation to animations object
			animations.animations[animId] = anim

			// Register animation on entity
			this.create(
				fileContent,
				{
					animations: {
						[shortAnimId]: animId,
					},
				},
				'minecraft:entity/description'
			)

			// Users can set the condition to false to skip running the animation automatically
			if (condition !== false)
				// Register animation on entity
				this.create(
					fileContent,
					{
						scripts: {
							animate: [
								!condition
									? shortAnimId
									: { [shortAnimId]: condition },
							],
						},
					},
					'minecraft:entity/description'
				)

			id++
		}

		return JSON.stringify(animations, null, '\t')
	}
	protected createAnimationControllers(fileName: string, fileContent: any) {
		if (this.animationControllers.length === 0) return

		let id = 0
		const animationControllers: any = {
			format_version: '1.10.0',
			animation_controllers: {},
		}

		for (const [anim, condition] of this.animationControllers) {
			if (!anim) {
				id++
				continue
			}

			// Create unique animId
			const animId = this.getAnimName(
				'controller.animation',
				fileName,
				id
			)
			// Create shorter reference to animId that's unique per entity
			const shortAnimId = this.getShortAnimName('ac', fileName, id)

			// Save animation controller to animationControllers object
			animationControllers.animation_controllers[animId] = anim

			// Register animation controller on entity
			this.create(
				fileContent,
				{
					animations: {
						[shortAnimId]: animId,
					},
				},
				'minecraft:entity/description'
			)

			// Users can set the condition to false to skip running the animation controller automatically
			if (condition !== false)
				// Register animation on entity
				this.create(
					fileContent,
					{
						scripts: {
							animate: [
								!condition
									? shortAnimId
									: { [shortAnimId]: condition },
							],
						},
					},
					'minecraft:entity/description'
				)

			id++
		}

		return JSON.stringify(animationControllers, null, '\t')
	}

	protected getAnimName(prefix: string, fileName: string, id: number) {
		return `${prefix}.${fileName}_${id}`
	}
	protected getShortAnimName(category: string, fileName: string, id: number) {
		return `${fileName.slice(0, 16) ?? 'bridge_auto'}_${category}_${id}`
	}

	/**
	 * Component lifecycle logic
	 */
	protected registerLifecycleHook(
		fileContent: any,
		location: string,
		eventResponse: any,
		permutationEventName: string,
		type: 'activated' | 'deactivated'
	) {
		if (!fileContent[`minecraft:${this.fileType}`].events)
			fileContent[`minecraft:${this.fileType}`].events = {}
		const entityEvents = fileContent[`minecraft:${this.fileType}`].events

		if (
			type === 'activated' &&
			location === `minecraft:${this.fileType}/components`
		) {
			if (!entityEvents['minecraft:entity_spawned'])
				entityEvents['minecraft:entity_spawned'] = {}

			this.addEventReponse(
				entityEvents['minecraft:entity_spawned'],
				eventResponse
			)
		} else if (
			this.fileType === 'entity' &&
			location.startsWith(`minecraft:${this.fileType}/component_groups/`)
		) {
			const componentGroupName = location.split('/').pop()!
			const eventsWithReferences = this.findComponentGroupReferences(
				entityEvents,
				type === 'activated' ? 'add' : 'remove',
				componentGroupName
			)

			eventsWithReferences.forEach((eventWithReference) =>
				this.addEventReponse(eventWithReference, eventResponse)
			)
		} else if (
			location.startsWith(`minecraft:${this.fileType}/permutations/`)
		) {
			const keys = location.split('/')
			if (keys.pop() !== 'components')
				throw new Error(
					'Invalid component location inside of permutation'
				)

			const loc = keys.join('/')
			const permutation = this.getObjAtLocation(fileContent, loc)
			const eventName = `bridge:${permutationEventName}_${type}`

			if (permutation.condition)
				this.animationControllers.push([
					{
						states: {
							default: {
								on_entry: [`@s ${eventName}`],
							},
						},
					},
					type === 'activated'
						? permutation.condition
						: `!(${permutation.condition})`,
				])

			entityEvents[eventName] = eventResponse
		}
	}
	/**
	 * Merge two events together
	 *
	 * @param event Base event
	 * @param eventResponse New event response
	 */
	protected addEventReponse(event: any, eventResponse: any) {
		if (Array.isArray(event.sequence)) {
			event.sequence.push(eventResponse)
		} else if (Object.keys(event).length === 0) {
			Object.assign(event, eventResponse)
		} else {
			let oldEvent = Object.assign({}, event, { filters: undefined })
			for (const key in event) {
				if (key !== 'filters') event[key] = undefined
			}

			event.sequence = [oldEvent, eventResponse]
		}
	}
	/**
	 * Find all references to a component group inside of the events
	 *
	 * @returns An array of event objects which have references to the component group
	 */
	protected findComponentGroupReferences(
		events: any,
		type: 'add' | 'remove',
		componentGroupName: string
	) {
		let eventsWithComponentGroups: any[] = []

		for (const eventName in events) {
			const event = events[eventName]

			if (Array.isArray(event.sequence))
				eventsWithComponentGroups.push(
					...this.findComponentGroupReferences(
						event.sequence,
						type,
						componentGroupName
					)
				)
			else if (Array.isArray(event.randomize))
				eventsWithComponentGroups.push(
					...this.findComponentGroupReferences(
						event.randomize,
						type,
						componentGroupName
					)
				)
			else {
				const componentGroups = event[type]?.component_groups ?? []
				if (componentGroups.includes(componentGroupName))
					eventsWithComponentGroups.push(event)
			}
		}

		return eventsWithComponentGroups
	}
}
