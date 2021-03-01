import { run } from '/@/components/Extensions/Scripts/run'
import { deepMerge } from '/@/utils/deepmerge'

export type TTemplate = (
	componentArgs: any,
	opts: {
		create: (t: any, loc: string) => any
		location: string
		animation: (animation: any) => void
		animationController: (animationController: any) => void
	}
) => any

export class Component {
	protected _name?: string
	protected schema?: any
	protected template?: TTemplate
	protected animations: any[] = []
	protected animationControllers: any[] = []
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

	getSchema() {
		return this.schema
	}

	create(fileContent: any, template: any, location?: string) {
		const keys = (location ?? '').split('/')

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
		// Setup animation/animationController helper
		const animation =
			this.fileType === 'entity'
				? (animation: any) => this.animations.push(animation)
				: () => 0
		const animationController =
			this.fileType === 'entity'
				? (animationController: any) =>
						this.animationControllers.push(animationController)
				: () => 0

		// Process template
		if (this.template)
			this.template(componentArgs ?? {}, {
				create: (template: any, location?: string) =>
					this.create(fileContent, template, location),
				location,
				animationController,
				animation,
			})
	}

	processAnimations(fileContent: any) {
		// Try getting file identifier
		const identifier =
			fileContent[`minecraft:${this.fileType}`]?.description
				?.identifier ?? 'bridge:no_identifier'

		const normalizedIdentifier = identifier.replace(':', '_')
		const normalizedName = this.name?.replace(':', '_')
		const animFileName = `BP/animations/bridge/${normalizedName}/${normalizedIdentifier}.json`
		const animControllerFileName = `BP/animation_controllers/bridge/${normalizedName}/${normalizedIdentifier}.json`

		return {
			[animFileName]: this.createAnimations(identifier, fileContent),
			[animControllerFileName]: this.createAnimationControllers(
				identifier,
				fileContent
			),
		}
	}

	protected createAnimations(identifier: string, fileContent: any) {
		if (this.animations.length === 0) return

		let id = 0
		const animations: any = { format_version: '1.10.0', animations: {} }

		for (const anim of this.animations) {
			if (!anim) continue

			// Create unique animId
			const animId = `animation.${
				this.name?.replace(':', '_') ?? 'bridge_auto'
			}.${identifier.replace(':', '_')}_${id}`
			// Create shorter reference to animId that's unique per entity
			const shortAnimId = `${
				this.name?.replace(':', '_') ?? 'bridge_auto'
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
					scripts: [shortAnimId],
				},
				'minecraft:entity/description'
			)

			id++
		}

		return JSON.stringify(animations, null, '\t')
	}
	protected createAnimationControllers(identifier: string, fileContent: any) {
		if (this.animationControllers.length === 0) return

		let id = 0
		const animationControllers: any = {
			format_version: '1.10.0',
			animation_controllers: {},
		}

		for (const anim of this.animationControllers) {
			if (!anim) continue

			// Create unique animId
			const animId = `controller.animation.${
				this.name?.replace(':', '_') ?? 'bridge_auto'
			}.${identifier.replace(':', '_')}_${id}`
			// Create shorter reference to animId that's unique per entity
			const shortAnimId = `${
				this.name?.replace(':', '_') ?? 'bridge_auto'
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
					scripts: [shortAnimId],
				},
				'minecraft:entity/description'
			)

			id++
		}

		return JSON.stringify(animationControllers, null, '\t')
	}
}
