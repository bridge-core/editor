import { run } from '/@/components/Extensions/Scripts/run'
import { deepMerge } from '/@/utils/deepmerge'
import { hashString } from '/@/utils/hash'

export type TTemplate = (componentArgs: any, opts: any) => any

export class Component {
	protected _name?: string
	protected schema?: any
	protected template?: TTemplate
	protected animations: [any, string | undefined][] = []
	protected animationControllers: [any, string | undefined][] = []
	protected createOnPlayer: [string, any][] = []
	constructor(protected fileType: string, protected componentSrc: string) {}

	//#region Getters
	get name() {
		return this._name
	}
	//#endregion

	async load(type?: 'server' | 'client') {
		const module = { exports: {} }
		run(
			this.componentSrc.replace('export default ', 'module.exports = '),
			[module, (x: any) => x],
			['module', 'defineComponent']
		)

		if (typeof module.exports !== 'function') return

		const name = (name: string) => (this._name = name)
		let schema: Function = (schema: any) => (this.schema = schema)
		let template: Function = () => {}
		if (!type || type === 'server') {
			schema = () => {}
			template = (func: TTemplate) => (this.template = func)
		}

		await module.exports({
			name,
			schema,
			template,
		})
	}
	reset() {
		// Clear previous animation (controllers)
		this.animations = []
		this.animationControllers = []
	}

	getSchema() {
		return this.schema
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

	processTemplates(fileContent: any, componentArgs: any, location: string) {
		if (typeof this.template !== 'function') return

		// Setup animation/animationController helper
		const animation = (animation: any, molangCondition?: string) =>
			this.animations.push([animation, molangCondition])

		const animationController = (
			animationController: any,
			molangCondition?: string
		) =>
			this.animationControllers.push([
				animationController,
				molangCondition,
			])

		// Try getting file identifier
		const identifier =
			fileContent[`minecraft:${this.fileType}`]?.description?.identifier

		// Execute template function with context for current fileType
		if (this.fileType === 'entity') {
			this.template(componentArgs ?? {}, {
				create: (template: any, location?: string) =>
					this.create(fileContent, template, location),
				location,
				identifier,
				animationController,
				animation,
			})
		} else if (this.fileType === 'item') {
			this.template(componentArgs ?? {}, {
				create: (template: any, location?: string) =>
					this.create(fileContent, template, location),
				location,
				identifier,
				player: {
					animationController,
					animation,
					create: (template: any, location?: string) =>
						this.createOnPlayer.push([
							location ?? `minecraft:player`,
							template,
						]),
				},
			})
		} else if (this.fileType === 'block') {
			this.template(componentArgs ?? {}, {
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
			if (!anim) continue

			// Create unique animId
			const animId = `animation.${fileName}_${id}`
			// Create shorter reference to animId that's unique per entity
			const shortAnimId = `${
				fileName.slice(0, 16) ?? 'bridge_auto'
			}_anim_${id}`

			// Save animation to animations object
			animations.animations[animId] = anim
			// Register animation on entity
			this.create(
				fileContent,
				{
					animations: {
						[shortAnimId]: animId,
					},
					scripts: [
						!condition ? shortAnimId : { [shortAnimId]: condition },
					],
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
			if (!anim) continue

			// Create unique animId
			const animId = `controller.animation.${fileName}_${id}`
			// Create shorter reference to animId that's unique per entity
			const shortAnimId = `${
				fileName.slice(0, 16) ?? 'bridge_auto'
			}_control_${id}`

			// Save animation to animationControllers object
			animationControllers.animation_controllers[animId] = anim
			// Register animation on entity
			this.create(
				fileContent,
				{
					animations: {
						[shortAnimId]: animId,
					},
					scripts: [
						!condition ? shortAnimId : { [shortAnimId]: condition },
					],
				},
				'minecraft:entity/description'
			)

			id++
		}

		return JSON.stringify(animationControllers, null, '\t')
	}
}
