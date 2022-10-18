import { App } from '/@/App'
import { FileImporter } from '/@/components/ImportFile/Importer'
import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { extname, join } from '/@/utils/path'
import { DropdownWindow } from '../Windows/Common/Dropdown/DropdownWindow'
import { clamp } from '/@/utils/math/clamp'

type Vector3D = [number, number, number]
type Vector2D = [number, number]

interface IBone {
	name: string
	parent?: string
	mirror?: boolean
	binding?: unknown
	reset?: boolean
	material?: unknown
	rotation?: Vector3D
	pivot?: Vector3D
	cubes?: ICube[]
	locators?: {
		[key: string]: ILocator
	}
}

interface ICube {
	origin?: Vector3D
	size: Vector3D
	rotation?: Vector3D
	inflate?: Vector3D
	pivot?: Vector3D
	uv?: Vector2D | any
	mirror?: boolean
}

interface ILocator {
	offset: Vector3D
	rotation?: Vector3D
}

interface IAnimation {
	loop?: string | boolean
	animation_length?: number
	override_previous_animation?: boolean
	anim_time_update?: string
	blend_weight?: string
	start_delay?: string
	loop_delay?: string
	bones?:
		| {
				[key: string]: object
		  }
		| undefined
	sound_effects?: {
		[key: string]: object
	}
	particle_effects?: {
		[key: string]: object
	}
	timeline?: {
		[key: string]: object
	}
}

export class BBModelImporter extends FileImporter {
	constructor(fileDropper: FileDropper) {
		super(['.bbmodel'], fileDropper)
	}

	async onImport(fileHandle: AnyFileHandle) {
		const app = await App.getApp()

		const file = await fileHandle.getFile()
		const data = JSON.parse(await file.text())

		app.windows.loadingWindow.open()

		const promises = []

		if (data.textures) promises.push(this.exportImages(app, data.textures))
		if (data.elements && data.outliner)
			promises.push(this.exportModel(app, data))
		if (data.animations)
			promises.push(
				this.exportAnimations(app, data.animations, data.name)
			)

		if (promises.length > 0) {
			await Promise.allSettled(promises)
			App.eventSystem.dispatch('fileAdded', undefined)
		}

		app.windows.loadingWindow.close()
	}

	async exportImages(app: App, textures: any[]) {
		for (let texture of textures) {
			const imageResponse = await fetch(texture.source)
			const imageData = await imageResponse.arrayBuffer()
			const imageType = imageResponse.headers.get('content-type')

			// Convert mime type to file extension
			let extension = 'png'
			switch (imageType) {
				case 'image/png':
					extension = 'png'
					break
				case 'image/jpeg':
				case 'image/jpg':
					extension = 'jpg'
					break
				case 'image/tga':
				case 'image/x-tga':
				case 'image/x-targa':
				case 'image/target':
				case 'application/x-tga':
				case 'application/x-targa':
					extension = 'tga'
					break
			}

			const folder = await new DropdownWindow({
				name: 'general.textureLocation',
				default: 'entity',
				options: ['entity', 'blocks', 'items'],
			}).fired

			// Compose file path
			const filePath = join(
				'RP',
				'textures',
				folder,
				extname(texture.name) === ''
					? `${texture.name}.${extension}`
					: texture.name
			)

			// Check whether file already exists
			const fileExists = await app.project.fileSystem.fileExists(filePath)
			if (fileExists) {
				const confirmWindow = new ConfirmationWindow({
					description: 'general.confirmOverwriteFile',
					confirmText: 'windows.createPreset.overwriteFilesConfirm',
				})

				confirmWindow.open()
				if (!(await confirmWindow.fired)) continue
			}

			const destHandle = await app.project.fileSystem.writeFile(
				filePath,
				imageData
			)

			app.project.updateFile(app.project.absolutePath(filePath))
			await app.project.openFile(destHandle, { isTemporary: false })
		}
	}

	async exportModel(app: App, data: any) {
		const entityModel = <any>{
			description: {
				identifier: 'geometry.' + (data.model_identifier || 'unknown'),
				texture_width: data.resolution.width || 16,
				texture_height: data.resolution.height || 16,
				visible_bounds_width: data.visible_box?.[0] ?? 0,
				visible_bounds_height: data.visible_box?.[1] ?? 0,
				visible_bounds_offset: [0, data.visible_box?.[2] ?? 0, 0],
			},
		}
		const entityFile = {
			format_version: '1.12.0',
			'minecraft:geometry': [entityModel],
		}

		const cubes = this.extractCubes(data.elements, data.meta.box_uv)
		const locators = this.extractLocators(data.elements)
		const bones = this.createBones(data, cubes, locators)

		if (bones.size > 0) entityModel.bones = [...bones.values()]

		const filePath = join('RP', 'models', 'entity', data.name + '.json')

		const fileExists = await app.project.fileSystem.fileExists(filePath)
		if (fileExists) {
			const confirmWindow = new ConfirmationWindow({
				description: 'general.confirmOverwriteFile',
				confirmText: 'windows.createPreset.overwriteFilesConfirm',
			})

			confirmWindow.open()
			if (!(await confirmWindow.fired)) return
		}

		const destHandle = await app.project.fileSystem.getFileHandle(
			filePath,
			true
		)

		await app.project.fileSystem.writeJSON(filePath, entityFile, true)

		app.project.updateFile(app.project.absolutePath(filePath))
		await app.project.openFile(destHandle, { isTemporary: false })
	}

	/**
	 * Extract cubes from bbmodel format (elements array)
	 *
	 * @param elements bbmodel elements
	 * @param hasBoxUV
	 * @returns Cube map
	 */
	extractCubes(elements: any[], hasBoxUV = true) {
		const cubes = new Map<string, ICube>()

		elements.forEach((element: any) => {
			if (element.type === 'locator') return

			const isRotatedCube =
				Array.isArray(element.rotation) &&
				element.rotation.every((r: number) => r !== 0)

			const cube: ICube = {
				origin: element.from ? <Vector3D>[...element.from] : undefined,
				size: element.to.map(
					(v: number, i: number) => v - element.from[i]
				),
				rotation: isRotatedCube
					? element.rotation.map((rot: number, i: number) =>
							i === 2 ? rot : -rot
					  )
					: undefined,
				pivot: isRotatedCube
					? [
							element.origin[0] * -1,
							element.origin[1],
							element.origin[2],
					  ]
					: undefined,
				inflate: element.inflate,
			}

			if (cube.origin) cube.origin[0] = -(cube.origin[0] + cube.size[0])

			if (hasBoxUV) {
				cube.uv = element.uv_offset
				if (element.mirror_uv) {
					cube.mirror = element.mirror_uv
				}
			} else {
				cube.uv = {}

				for (const [faceName, face] of Object.entries<any>(
					element.faces
				)) {
					if (face.texture !== null) {
						cube.uv[faceName] = {
							uv: [face.uv[0], face.uv[1]],
							uv_size: [
								face.uv[2] - face.uv[0],
								face.uv[3] - face.uv[1],
							],
						}

						if (face.material_name) {
							cube.uv[faceName].material_instance =
								face.material_name
						}

						if (faceName === 'up' || faceName === 'down') {
							cube.uv[faceName].uv[0] +=
								cube.uv[faceName].uv_size[0]
							cube.uv[faceName].uv[1] +=
								cube.uv[faceName].uv_size[1]
							cube.uv[faceName].uv_size[0] *= -1
							cube.uv[faceName].uv_size[1] *= -1
						}
					}
				}
			}

			cubes.set(element.uuid, cube)
		})

		return cubes
	}

	/**
	 * Extract all locators from bbmodel format (elements array)
	 *
	 * @param elements bbmodel elements (locators or cubes)
	 * @returns Locator map
	 */
	extractLocators(elements: any[]) {
		const locators = new Map<string, ILocator>()

		elements.forEach((element: any) => {
			if (element.type !== 'locator') return

			const locator: ILocator = {
				offset: <Vector3D>[...element.from],
			}
			locator.offset[0] *= -1

			if (
				element.rotation[0] !== 0 ||
				element.rotation[1] !== 0 ||
				element.rotation[2] !== 0
			) {
				locator.rotation = [
					-element.rotation[0],
					-element.rotation[0],
					element.rotation[0],
				]
			}

			locators.set(element.name, locator)
		})

		return locators
	}

	/**
	 * Create all bones of the model
	 *
	 * @param data bbmodel file data
	 * @param cubes
	 * @param locators
	 * @returns Bone map
	 */
	createBones(
		data: any,
		cubes: Map<string, ICube>,
		locators: Map<string, ILocator>
	) {
		const bones = new Map<string, IBone>()

		if (Array.isArray(data.outliner))
			data.outliner.forEach((outlinerElement: any) =>
				this.parseOutlinerElement(
					outlinerElement,
					bones,
					cubes,
					locators
				)
			)

		return bones
	}

	/**
	 * An outliner element is Blockbench's equivalent to a bone
	 *
	 * @param outlinerElement Outliner element
	 * @param bones Bone map
	 * @param cubes
	 * @param locators
	 * @param parent Parent bone
	 */
	parseOutlinerElement(
		outlinerElement: any,
		bones: Map<string, IBone>,
		cubes: Map<string, ICube>,
		locators: Map<string, ILocator>,
		parent?: IBone
	) {
		const bone: IBone = {
			name: outlinerElement.name,
			parent: parent?.name,
			pivot: outlinerElement.origin
				? [
						outlinerElement.origin[0] * -1,
						outlinerElement.origin[1],
						outlinerElement.origin[2],
				  ]
				: undefined,
			rotation: outlinerElement.rotation
				? [
						outlinerElement.rotation[0] * -1,
						outlinerElement.rotation[1] * -1,
						outlinerElement.rotation[2],
				  ]
				: undefined,
			binding: outlinerElement.bedrock_binding,
			mirror: outlinerElement.mirror_uv,
			material: outlinerElement.material,
			reset: outlinerElement.reset,
			cubes: outlinerElement.children
				.filter((child: any) => typeof child === 'string')
				.map((child: string) => cubes.get(child))
				.filter((child: ICube | undefined) => child !== undefined),
			locators: Object.fromEntries(
				outlinerElement.children
					.filter(
						(locatorName: any) => typeof locatorName === 'string'
					)
					.map((locatorName: string) => [
						locatorName,
						locators.get(locatorName),
					])
					.filter(
						([locatorName, locator]: [
							string,
							ILocator | undefined
						]) => locator !== undefined
					)
			),
		}

		if (bone.cubes!.length === 0) bone.cubes = undefined
		if (Object.keys(bone.locators!).length === 0) bone.locators = undefined

		bones.set(outlinerElement.name, bone)

		if (Array.isArray(outlinerElement.children)) {
			for (let child of outlinerElement.children) {
				if (!(child instanceof Object)) continue

				this.parseOutlinerElement(child, bones, cubes, locators, bone)
			}
		}
	}

	async exportAnimations(app: App, animations: any[], model_name: string) {
		const animationFile = {
			format_version: '1.8.0',
			animations: <any>{},
		}

		for (let animation of animations) {
			let loop = undefined
			if (animation.loop === 'hold') {
				loop = 'hold_on_last_frame'
			} else if (
				animation.loop === 'loop' ||
				this.getAnimationLength(animation) == 0
			) {
				loop = true
			}

			const anim: IAnimation = {
				loop: loop,
				animation_length: animation.length
					? animation.length
					: undefined,
				override_previous_animation: animation.override
					? true
					: undefined,
				anim_time_update: animation.anim_time_update
					? animation.anim_time_update.replace(/\n/g, '')
					: undefined,
				blend_weight: animation.blend_weight
					? animation.blend_weight.replace(/\n/g, '')
					: undefined,
				start_delay: animation.start_delay
					? animation.start_delay.replace(/\n/g, '')
					: undefined,
				loop_delay:
					animation.loop_delay && loop
						? animation.loop_delay.replace(/\n/g, '')
						: undefined,
				bones: <any>{},
				sound_effects: <any>{},
				particle_effects: <any>{},
				timeline: <any>{},
			}

			for (let uuid in animation.animators) {
				let animator = animation.animators[uuid]
				if (!animator.keyframes.length) continue
				if (animator.type === 'effect') {
					animator.keyframes
						.filter((kf: any) => kf.channel === 'sound')
						.sort((kf1: any, kf2: any) => kf1.time - kf2.time)
						.forEach((kf: any) => {
							anim.sound_effects![
								this.getTimecodeString(kf.time)
							] = this.compileBedrockKeyframe(kf, animator)
						})
					animator.keyframes
						.filter((kf: any) => kf.channel === 'particle')
						.sort((kf1: any, kf2: any) => kf1.time - kf2.time)
						.forEach((kf: any) => {
							anim.particle_effects![
								this.getTimecodeString(kf.time)
							] = this.compileBedrockKeyframe(kf, animator)
						})
					animator.keyframes
						.filter((kf: any) => kf.channel === 'timeline')
						.sort((kf1: any, kf2: any) => kf1.time - kf2.time)
						.forEach((kf: any) => {
							anim.timeline![this.getTimecodeString(kf.time)] =
								this.compileBedrockKeyframe(kf, animator)
						})
				} else if (
					animator.type === 'bone' ||
					animator.type === undefined // No defined type: Default is type "bone"
				) {
					let bone_tag: any = (anim.bones![animator.name] = {})
					let channels: any = {}

					animator.keyframes.forEach((kf: any) => {
						if (!channels[kf.channel]) {
							channels[kf.channel] = {}
						}
						let timecode = this.getTimecodeString(kf.time)
						channels[kf.channel][timecode] =
							this.compileBedrockKeyframe(kf, animator)
					})

					//Sorting
					for (let channel of [
						'rotation',
						'position',
						'scale',
						'particle',
						'sound',
						'timeline',
					]) {
						if (channels[channel]) {
							let timecodes = Object.keys(channels[channel])
							if (
								timecodes.length === 1 &&
								animator.keyframes[0].data_points.length == 1 &&
								animator.keyframes[0].interpolation !=
									'catmullrom'
							) {
								bone_tag[channel] =
									channels[channel][timecodes[0]]
								if (
									channel === 'scale' &&
									channels[channel][timecodes[0]] instanceof
										Array &&
									channels[channel][timecodes[0]].every(
										(a: any) =>
											a !==
											channels[channel][timecodes[0]][0]
									)
								) {
									bone_tag[channel] =
										channels[channel][timecodes[0]][0]
								}
							} else {
								timecodes
									.sort(
										(a: string, b: string) =>
											parseFloat(a) - parseFloat(b)
									)
									.forEach((timecode: string) => {
										if (!bone_tag[channel]) {
											bone_tag[channel] = {}
										}
										bone_tag[channel][timecode] =
											channels[channel][timecode]
									})
							}
						}
					}
				}
			}

			if (Object.keys(anim.bones!).length == 0) {
				delete anim.bones
			}
			if (Object.keys(anim.sound_effects!).length == 0) {
				delete anim.sound_effects
			}
			if (Object.keys(anim.particle_effects!).length == 0) {
				delete anim.particle_effects
			}
			if (Object.keys(anim.timeline!).length == 0) {
				delete anim.timeline
			}

			animationFile.animations[animation.name] = anim
		}
		const filePath = join(
			'RP',
			'animations',
			model_name + '.animation.json'
		)

		const fileExists = await app.project.fileSystem.fileExists(filePath)
		if (fileExists) {
			const confirmWindow = new ConfirmationWindow({
				description: 'general.confirmOverwriteFile',
				confirmText: 'windows.createPreset.overwriteFilesConfirm',
			})

			confirmWindow.open()
			if (!(await confirmWindow.fired)) return
		}

		const destHandle = await app.project.fileSystem.getFileHandle(
			filePath,
			true
		)

		await app.project.fileSystem.writeJSON(filePath, animationFile, true)

		app.project.updateFile(app.project.absolutePath(filePath))
		await app.project.openFile(destHandle, { isTemporary: false })
	}

	/**
	 * Returns a compiled keyframe
	 *
	 * @param kf keyframe
	 * @param animator parent animator object
	 * @returns compiled keyframe
	 */
	compileBedrockKeyframe(kf: any, animator: any) {
		if (
			kf.channel === 'rotation' ||
			kf.channel === 'position' ||
			kf.channel === 'scale'
		) {
			if (kf.interpolation != 'linear' && kf.interpolation != 'step') {
				let previous = this.getPreviousKeyframe(kf, animator)
				let include_pre =
					(!previous && kf.time > 0) ||
					(previous && previous.interpolation == 'catmullrom')
				return {
					pre: include_pre
						? this.getTransformArray(kf, 0)
						: undefined,
					post: this.getTransformArray(kf, include_pre ? 1 : 0),
					lerp_mode: kf.interpolation,
				}
			} else if (kf.data_points.length == 1) {
				let previous = this.getPreviousKeyframe(kf, animator)
				if (previous && previous.interpolation == 'step') {
					return {
						pre: this.getTransformArray(previous, 1),
						post: this.getTransformArray(kf),
					}
				} else {
					return this.getTransformArray(kf)
				}
			} else {
				return {
					pre: this.getTransformArray(kf, 0),
					post: this.getTransformArray(kf, 1),
				}
			}
		} else if (kf.channel === 'timeline') {
			let scripts: any[] = []
			kf.data_points.forEach((data_point: any) => {
				if (data_point.script) {
					scripts.push(...data_point.script.split('\n'))
				}
			})
			scripts = scripts.filter(
				(script) => !!script.replace(/[\n\s;.]+/g, '')
			)
			return scripts.length <= 1 ? scripts[0] : scripts
		} else {
			let points: any[] = []
			kf.data_points.forEach((data_point: any) => {
				if (data_point.effect) {
					let script = data_point.script || undefined
					if (script && !script.replace(/[\n\s;.]+/g, ''))
						script = undefined
					if (script && !script.match(/;$/)) script += ';'
					points.push({
						effect: data_point.effect,
						locator: data_point.locator || undefined,
						pre_effect_script: script,
					})
				}
			})
			return points.length <= 1 ? points[0] : points
		}
	}

	/**
	 * Returns the previous keyframe
	 *
	 * @param kf keyframe
	 * @param animator parent animator object
	 * @returns previous keyframe
	 */
	getPreviousKeyframe(kf: any, animator: any) {
		let keyframes = animator.keyframes.filter(
			(filter: any) =>
				filter.time < kf.time && filter.channel == kf.channel
		)
		keyframes.sort((a: any, b: any) => b.time - a.time)
		return keyframes[0]
	}

	/**
	 * Transforms a data point to an array
	 *
	 * @param kf keyframe
	 * @param data_point Data point index
	 * @returns Array
	 */
	getTransformArray(kf: any, data_point: number = 0) {
		function getAxis(kf: any, axis: string, data_point: any) {
			if (data_point)
				data_point = clamp(data_point, 0, kf.data_points.length - 1)
			data_point = kf.data_points[data_point]
			if (!data_point || !data_point[axis]) {
				return 0
			} else if (!isNaN(data_point[axis])) {
				let num = parseFloat(data_point[axis])
				return isNaN(num) ? 0 : num
			} else {
				return data_point[axis]
			}
		}

		let arr = [
			getAxis(kf, 'x', data_point),
			getAxis(kf, 'y', data_point),
			getAxis(kf, 'z', data_point),
		]
		arr.forEach((n, i) => {
			if (n.replace) arr[i] = n.replace(/\n/g, '')
		})
		return arr
	}

	/**
	 * Returns the length of the animation
	 *
	 * @param animation object
	 * @returns animation length
	 */
	getAnimationLength(animation: any) {
		let length = animation.length || 0

		for (let uuid in animation.animators) {
			let bone = animation.animators[uuid]
			let keyframes = bone.keyframes
			if (
				keyframes.find((kf: any) => kf.interpolation === 'catmullrom')
			) {
				keyframes = keyframes
					.slice()
					.sort((a: any, b: any) => a.time - b.time)
			}
			keyframes.forEach((kf: any, i: number) => {
				if (
					kf.interpolation === 'catmullrom' &&
					i == keyframes.length - 1
				)
					return
				length = Math.max(length, keyframes[i].time)
			})
		}
		return length
	}

	/**
	 * Transforms a number into a string
	 *
	 * @param time number
	 * @returns time string
	 */
	getTimecodeString(time: number) {
		let timecode = this.trimFloatNumber(time).toString()
		if (!timecode.includes('.')) {
			timecode += '.0'
		}
		return timecode
	}

	/**
	 * Trims a float number to 4 digits
	 *
	 * @param number
	 * @returns trimmed number
	 */
	trimFloatNumber(number: any) {
		if (number === '') return number
		let string = number.toFixed(4)
		//First regex removes all '0' at the end | Second regex removes the dot at the end if any
		string = string.replace(/0+$/g, '').replace(/\.$/g, '')
		if (string === '-0') return 0
		return string
	}
}
