import { App } from '/@/App'
import { FileImporter } from '/@/components/ImportFile/Importer'
import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { join } from '/@/utils/path'
import json5 from 'json5'
import { DropdownWindow } from '../Windows/Common/Dropdown/DropdownWindow'

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
	pivot: Vector3D
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

export class BBModelImporter extends FileImporter {
	constructor(fileDropper: FileDropper) {
		super(['.bbmodel'], fileDropper)
	}

	async onImport(fileHandle: AnyFileHandle) {
		const app = await App.getApp()

		const file = await fileHandle.getFile()
		const data = json5.parse(await file.text())

		app.windows.loadingWindow.open()

		await this.exportImages(app, data.textures)
		await this.exportModel(app, data)

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
				texture.folder,
				`${texture.name}.${extension}`
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
			App.eventSystem.dispatch('fileAdded', undefined)

			await app.project.updateFile(filePath)
			await app.project.openFile(destHandle, { isTemporary: false })
		}
	}

	async exportModel(app: App, data: any) {
		const entityModel = <any>{
			description: {
				identifier: 'geometry.' + (data.geometry_name || 'unknown'),
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
		App.eventSystem.dispatch('fileAdded', undefined)

		await app.project.updateFile(filePath)
		await app.project.openFile(destHandle, { isTemporary: false })
	}

	/**
	 * Extract cubes from bbmodel format (elements array)
	 *
	 * @param elements bbmodel elements
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
	 * @param element Outliner element
	 * @param bones Bone map
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
			pivot: [
				outlinerElement.origin[0] * -1,
				outlinerElement.origin[1],
				outlinerElement.origin[2],
			],
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
}
