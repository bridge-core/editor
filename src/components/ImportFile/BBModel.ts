import { App } from '/@/App'
import { FileImporter } from '/@/components/ImportFile/Importer'
import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { join } from '/@/utils/path'
import json5 from 'json5'

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

			// Compose file path
			const filePath = join(
				'RP',
				'textures',
				'entity',
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

	// From: https://github.com/JannisX11/blockbench/blob/1701f764641376414d29100c4f6c7cd74997fad8/js/io/formats/bedrock.js#L652
	async exportModel(app: App, data: any) {
		let entitymodel = {} as any
		let main_tag = {
			format_version: '1.12.0',
			'minecraft:geometry': [entitymodel],
		}
		entitymodel.description = {
			identifier: 'geometry.' + (data.geometry_name || 'unknown'),
			texture_width: data.resolution.width || 16,
			texture_height: data.resolution.height || 16,
		}
		let bones: any[] = []

		let groups = this.getAllGroups(data)
		groups.forEach((group) => {
			let bone = this.compileGroup(data, group)
			bones.push(bone)
		})

		if (bones.length) {
			let visible_box = this.calculateVisibleBox(data)
			entitymodel.description.visible_bounds_width = visible_box[0] || 0
			entitymodel.description.visible_bounds_height = visible_box[1] || 0
			entitymodel.description.visible_bounds_offset = [
				0,
				visible_box[2] || 0,
				0,
			]

			entitymodel.bones = bones
		}

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

		await app.project.fileSystem.writeJSON(filePath, main_tag, true)
		App.eventSystem.dispatch('fileAdded', undefined)

		await app.project.updateFile(filePath)
		await app.project.openFile(destHandle, { isTemporary: false })
	}

	//From: https://github.com/JannisX11/blockbench/blob/1701f764641376414d29100c4f6c7cd74997fad8/js/outliner/group.js#L492
	getAllGroups(data: any) {
		let groups: any[] = []

		function iterate(array: any[], parent: undefined) {
			for (let obj of array) {
				if (obj instanceof Object) {
					obj.parent = parent
					groups.push(obj)
					iterate(obj.children, obj.name)
				}
			}
		}

		iterate(data.outliner, undefined)
		return groups
	}

	//From: https://github.com/JannisX11/blockbench/blob/1701f764641376414d29100c4f6c7cd74997fad8/js/io/formats/bedrock.js#L571
	compileGroup(data: any, group: any) {
		let bone = {} as any
		bone.name = group.name
		bone.parent = group.parent
		bone.pivot = group.origin.slice()
		bone.pivot[0] *= -1
		if (group.rotation) {
			if (
				group.rotation[0] !== 0 ||
				group.rotation[1] !== 0 ||
				group.rotation[2] !== 0
			) {
				bone.rotation = group.rotation.slice()
				bone.rotation[0] *= -1
				bone.rotation[1] *= -1
			}
		}
		if (group.bedrock_binding) {
			bone.binding = group.bedrock_binding
		}
		if (group.reset) {
			bone.reset = true
		}
		if (group.mirror_uv && data.meta.box_uv) {
			bone.mirror = true
		}
		if (group.material) {
			bone.material = group.material
		}

		let cubes = []
		let locators: any = {}

		for (let child of group.children) {
			if (!(child instanceof Object)) {
				let element = data.elements.find(
					(element: { uuid: string }) => element.uuid === child
				)
				if (element.type !== 'locator') {
					let cube = this.compileCube(data, element, bone)
					cubes.push(cube)
				} else if (element.type === 'locator') {
					let key = element.name
					let offset = element.from.slice()
					offset[0] *= -1

					if (
						element.rotation[0] !== 0 ||
						element.rotation[1] !== 0 ||
						element.rotation[2] !== 0
					) {
						locators[key] = {
							offset,
							rotation: [
								-element.rotation[0],
								-element.rotation[0],
								element.rotation[0],
							],
						}
					} else {
						locators[key] = offset
					}
				}
			}
		}

		if (cubes.length) {
			bone.cubes = cubes
		}
		if (Object.keys(locators).length) {
			bone.locators = locators
		}
		return bone
	}

	//From: https://github.com/JannisX11/blockbench/blob/1701f764641376414d29100c4f6c7cd74997fad8/js/io/formats/bedrock.js#L516
	compileCube(data: any, element: any, bone: any) {
		let cube = {
			origin: element.from ? element.from.slice() : undefined,
			size: [
				element.to[0] - element.from[0],
				element.to[1] - element.from[1],
				element.to[2] - element.from[2],
			],
			inflate: element.inflate || undefined,
		} as any
		cube.origin[0] = -(cube.origin[0] + cube.size[0])

		if (element.rotation) {
			if (
				element.rotation[0] !== 0 ||
				element.rotation[1] !== 0 ||
				element.rotation[2] !== 0
			) {
				cube.pivot = element.origin.slice()
				cube.pivot[0] *= -1

				cube.rotation = element.rotation.slice()
				cube.rotation.forEach(function (br: any, axis: number) {
					if (axis !== 2) cube.rotation[axis] *= -1
				})
			}
		}

		if (data.meta.box_uv) {
			cube.uv = element.uv_offset
			if (element.mirror_uv === !bone.mirror) {
				cube.mirror = element.mirror_uv
			}
		} else {
			cube.uv = {}
			for (let key in element.faces) {
				let face = element.faces[key]
				if (face.texture !== null) {
					cube.uv[key] = {
						uv: [face.uv[0], face.uv[1]],
						uv_size: [
							face.uv[2] - face.uv[0],
							face.uv[3] - face.uv[1],
						],
					}
					if (face.material_name) {
						cube.uv[key].material_instance = face.material_name
					}
					if (key === 'up' || key === 'down') {
						cube.uv[key].uv[0] += cube.uv[key].uv_size[0]
						cube.uv[key].uv[1] += cube.uv[key].uv_size[1]
						cube.uv[key].uv_size[0] *= -1
						cube.uv[key].uv_size[1] *= -1
					}
				}
			}
		}
		return cube
	}

	//From: https://github.com/JannisX11/blockbench/blob/1701f764641376414d29100c4f6c7cd74997fad8/js/io/formats/bedrock.js#L276
	calculateVisibleBox(data: any) {
		let visible_box = {
			max: {
				x: 0,
				y: 0,
				z: 0,
			},
			min: {
				x: 0,
				y: 0,
				z: 0,
			},
		}

		const elements: any[] = data.elements
		elements.forEach((element) => {
			if (!element.to || !element.from) return

			visible_box.max.x = Math.max(
				visible_box.max.x,
				element.from[0],
				element.to[0]
			)
			visible_box.min.x = Math.min(
				visible_box.min.x,
				element.from[0],
				element.to[0]
			)

			visible_box.max.y = Math.max(
				visible_box.max.y,
				element.from[1],
				element.to[1]
			)
			visible_box.min.y = Math.min(
				visible_box.min.y,
				element.from[1],
				element.to[1]
			)

			visible_box.max.z = Math.max(
				visible_box.max.z,
				element.from[2],
				element.to[2]
			)
			visible_box.min.z = Math.min(
				visible_box.min.z,
				element.from[2],
				element.to[2]
			)
		})

		visible_box.max.x += 8
		visible_box.min.x += 8
		visible_box.max.y += 8
		visible_box.min.y += 8
		visible_box.max.z += 8
		visible_box.min.z += 8

		//Width
		let radius = Math.max(
			visible_box.max.x,
			visible_box.max.z,
			-visible_box.min.x,
			-visible_box.min.z
		)
		if (Math.abs(radius) === Infinity) {
			radius = 0
		}
		let width = Math.ceil((radius * 2) / 16)
		width = Math.max(width, data.visible_box[0])

		//Height
		let y_min = Math.floor(visible_box.min.y / 16)
		let y_max = Math.ceil(visible_box.max.y / 16)
		if (y_min === Infinity) y_min = 0
		if (y_max === Infinity) y_max = 0
		y_min = Math.min(y_min, data.visible_box[2] - data.visible_box[1] / 2)
		y_max = Math.max(y_max, data.visible_box[2] + data.visible_box[1] / 2)

		return [width, y_max - y_min, (y_max + y_min) / 2]
	}
}
