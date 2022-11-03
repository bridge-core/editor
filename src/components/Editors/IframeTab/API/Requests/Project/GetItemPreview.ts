import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'
import { findFileExtension } from '/@/components/FileSystem/FindFile'

export class GetItemPreviewRequest extends GenericRequest<
	string,
	string | null
> {
	constructor(api: IframeApi) {
		super('project.getItemPreview', api)
	}

	async handle(identifier: string, origin: string) {
		const app = this.api.app
		const project = app.project
		const packIndexer = project.packIndexer
		const fs = app.fileSystem
		await packIndexer.fired

		const [identifierReference] = await packIndexer.service.find(
			'item',
			'identifier',
			[identifier],
			false
		)

		// Read item behavior file
		const itemBehaviorFile = await fs
			.readJSON(identifierReference)
			.catch(() => null)
		if (itemBehaviorFile === null) return null

		// Get 'minecraft:icon' component from item behavior
		const iconComponent =
			itemBehaviorFile['minecraft:item']?.components?.[
				'minecraft:icon'
			] ?? null
		if (iconComponent === null) return null

		// Get current texture name from icon component
		const iconTextureName = iconComponent.texture ?? null
		if (iconTextureName === null) return null

		// Lookup texture name within item_texture.json file
		const itemTextureFile = await fs
			.readJSON(
				project.config.resolvePackPath(
					'resourcePack',
					'textures/item_texture.json'
				)
			)
			.catch(() => null)
		if (itemTextureFile === null || !itemTextureFile.texture_data)
			return null

		const iconTextureDataObj =
			itemTextureFile.texture_data[iconTextureName] ?? null
		if (iconTextureDataObj === null) return null

		// Load icon texture path from icon texture data object ({ textures: '...' }, { textures: ['...'] } or '...')
		let iconTexturePath = null
		if (typeof iconTextureDataObj === 'string')
			iconTexturePath = iconTextureDataObj
		else if (
			typeof iconTextureDataObj === 'object' &&
			typeof iconTextureDataObj.textures === 'string'
		)
			iconTexturePath = iconTextureDataObj.textures
		else if (
			typeof iconTextureDataObj === 'object' &&
			Array.isArray(iconTextureDataObj.textures)
		)
			iconTexturePath = iconTextureDataObj.textures[0] ?? null

		if (iconTexturePath === null) return null

		// Find icon texture file extension
		const absolutePathWithoutExt = project.config.resolvePackPath(
			'resourcePack',
			iconTexturePath
		)
		console.log(absolutePathWithoutExt)

		const absolutePath = await findFileExtension(
			fs,
			absolutePathWithoutExt,
			['.png', '.jpg', '.jpeg', '.tga']
		)
		console.log(absolutePath)
		if (absolutePath === undefined) return null

		// Load file handle as data url
		const imageHandle = await fs
			.getFileHandle(absolutePath)
			.catch(() => null)
		if (imageHandle === null) return null

		return await fs.loadFileHandleAsDataUrl(imageHandle)
	}
}
