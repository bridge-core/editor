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

	constructor(
		protected fileType: string,
		protected componentSrc: string,
		protected mode: 'build' | 'dev',
		protected v1Compat: boolean
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

		let current: any = fileContent

		while (keys.length > 1) {
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

		current[keys[0]] = deepMerge(current[keys[0]] ?? {}, template ?? {})
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

		// Execute template function with context for current fileType
		if (this.fileType === 'entity') {
			this.template(componentArgs ?? {}, {
				// @deprecated remove with next major version
				mode: this.mode,
				compilerMode: this.mode,
				create: (template: any, location?: string) =>
					this.create(fileContent, template, location),
				location,
				identifier,
				animationController,
				animation,
			})
		} else if (this.fileType === 'item') {
			this.template(componentArgs ?? {}, {
				// @deprecated remove with next major version
				mode: this.mode,
				compilerMode: this.mode,
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
				compilerMode: this.mode,
				create: (template: any, location?: string) =>
					this.create(fileContent, template, location),
				location,
				identifier,
			})
		}
	}

	async processAnimations(fileContent: any) {
		// Try getting file identifier
		const identifier =
			fileContent[`minecraft:${this.fileType}`]?.description
				?.identifier ?? 'bridge:no_identifier'

		const fileName = await hashString(`${this.name}/${identifier}`)
		const animFileName = `BP/animations/bridge/${fileName}.json`
		const animControllerFileName = `BP/animation_controllers/bridge/${fileName}.json`

		this.createOnPlayer.forEach(([location, template]) => {
			this.create(fileContent, template, location)
		})

		return {
			[animFileName]: this.createAnimations(fileName, fileContent),
			[animControllerFileName]: this.createAnimationControllers(
				fileName,
				fileContent
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
}
